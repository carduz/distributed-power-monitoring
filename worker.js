/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let actived = false;
let functions = require('./functions');
let utils = require('./utils');

if(process.argv.length != 3){
    console.error('Usage node worker.js {master address}');
    process.exit();
}

const ioClient = require('socket.io-client');
var socket = ioClient(process.argv[2]);
let workers = {};

socket.on('connect', ()=>{
    console.log('connected');
    socket.emit('worker');
});
socket.on('event', (data)=>{});
socket.on('disconnect', ()=>{
    console.log('connection closed by the server');
    socket.close();
    if (actived) {
        io.close();
        server.close();
    }
    //TODO close also normal clients
    Object.keys(workers).map(key=>workers[key].close());
});

//TODO socket created listeners

let workerData = {};
socket.on('port', (data)=>{
    //TODO restart server changing port
    if(actived)
        return ;
    workerData = data;
    server.listen(data.port);
    console.log('Local server open on port', data.port);
    actived = true;
});
let dataReceived;

socket.on('worker', (type, id, address)=>{
    console.log('Worker', type, id);
    if(type == 'delete') {
        workers[id].close();
        delete workers[id];
    }else{
        utils.connectPromise(address).then((value)=>{
            workers[id] = value.connection; //ID of master is used
        });
    }
});

let functionPointer = null;
let routerPointer = null;
socket.on('function', (data)=>{
    dataReceived = data;
    let functionObj = functions[data.function];
    try {
        //this things are here since the connections are more than one (connections with other workers)
        functionPointer = functionObj.handler(workerData.id, dataReceived.parameters);
        routerPointer = functionObj.router(workerData.id, dataReceived.functions, dataReceived.order);
    }catch(e)
    {
        console.error(e.stack);
    }
    console.log('function set');
    socket.emit('function set');
});

io.on('connection', (client)=> {
    console.log('client connected');

    client.on('job', (data)=> {
        if (!functionPointer)
            return;
        try {
            let nextData = functionPointer(data);
            if(routerPointer){
                let next = routerPointer(nextData);
                //TODO wait if next worker is not present, maybe a queue is a solution, check also if it exists
                if(next)
                    workers[next].emit('job', nextData);
            }

        }catch(e)
        {
            console.error(e.stack);
        }
    });
});