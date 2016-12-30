/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
const BASE_PORT = 3000;

let clients = {};

//TODO do this thing based on real address, a sort of map realAddress -> portCounter
let portCounter = BASE_PORT+1;
io.on('connection', (client)=>{
    let id = client.id;
    let port = portCounter++;
    client[id] = {client: client, port: port};
    console.log('Client connected', id);
    client.on('event', (data)=>{});
    client.on('disconnect', ()=>{
        console.log('Client disconnected', id);
        delete clients[id];
    });
    client.emit('port', port);
});
server.listen(BASE_PORT);