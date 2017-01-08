/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let functions = require('./functions');
const BASE_PORT = 3000;

let workers = {};
class Worker{
    constructor(client, port) {
        this.client = client;
        this.port = port;
        this.functionSetCB = function(){};
    }
}

//TODO do this thing based on real address, a sort of map realAddress -> portCounter
let portCounter = BASE_PORT+1;
io.on('connection', (client)=>{
    let id = client.id;
    let worker = false;
    let port = 0;
    console.log('Client connected', id);
    client.on('event', (data)=>{});
    client.on('disconnect', ()=>{
        console.log('Client disconnected', id);
        if(worker)
            delete workers[id];
    });
    client.on('worker',()=>{
        worker = true;
        port = portCounter++;
        workers[id] = new Worker(client, port);
        client.emit('port', {port:port, id: id});
        client.emit('function', 'print'); //set function in a bad way
    });
    client.on('function set',()=> {
        workers[id].functionSetCB(); //this way to call the new version of functionSetCB
    });

    client.on('client',(functions)=>{
        //TODO promise all of data received from workers
        allFunctionsSet(()=>{
            client.emit('workers', Object.keys(workers).map(key=>'http://localhost:'+workers[key].port)); //bad way
        });
        assignFunctions(functions);
    });
});

server.listen(BASE_PORT);
console.log('Master on port', BASE_PORT);


function allFunctionsSet(cb) {
    let toConsume = Object.keys(workers);
    Object.keys(workers).forEach((key)=>{
        workers[key].functionSetCB = ()=>{
            let position = toConsume.indexOf(key);
            if(position>=0)
                toConsume.splice(position,1);
            if(!toConsume.length)
                cb();
        }
    });
}

function emitAllWorkers(channel, msg){
    msg = msg || '';
    Object.keys(workers).forEach((key)=>{
        let value = workers[key];
        value.client.emit(channel, msg);
    });
}

function assignFunctions(functions){
    //TODO ...
    emitAllWorkers('function', 'print');
}