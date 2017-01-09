/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let actived = false;
let functions = require('./functions');

if(process.argv.length != 3){
    console.error('Usage node worker.js {master address}');
    process.exit();
}

var socket = require('socket.io-client')(process.argv[2]);

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
let functionPointer = null;
let dataReceived;

socket.on('function', (data)=>{
    dataReceived = data;
    let functionObj = functions[data.function];
    try {
        functionPointer = functionObj.handler(workerData.id, dataReceived.parameters);
    }catch(e)
    {
        console.error(e.stack);
    }
    console.log('function set', data);
    socket.emit('function set');
});

io.on('connection', (client)=> {
    console.log('client connected');

    client.on('job', (data)=> {
        if (!functionPointer)
            return;
        try {
            functionPointer(data);
        }catch(e)
        {
            console.error(e.stack);
        }
    });
});