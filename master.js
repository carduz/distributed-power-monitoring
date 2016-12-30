/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let functions = require('./functions');
const BASE_PORT = 3000;

let workers = {};

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
        workers[id] = {client: client, port: port};
        client.emit('port', {port:port, id: id});
        client.emit('function', 'print'); //set function in a bad way
    });
    client.on('client',()=>{
        client.emit('workers', Object.keys(workers).map(key=>'http://localhost:'+workers[key].port)); //bad way
    });
});

server.listen(BASE_PORT);