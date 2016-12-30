/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let actived = false;

if(process.argv.length != 3){
    console.error('Usage node worker.js {master address}');
    process.exit();
}

var socket = require('socket.io-client')(process.argv[2]);

socket.on('connect', ()=>{
    console.log('connected');
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

socket.on('port', (data)=>{
    //TODO restart server changing port
    if(actived)
        return ;
    server.listen(data);
    actived = true;
});