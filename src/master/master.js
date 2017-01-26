/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let workersListClass = require('./workersList');
let workers = require('./workers');
let clients = require('./clients');
const BASE_PORT = 3000;

//namespaces
let ioWorkers = io.of('/workers');
let ioClients = io.of('/clients');

//init
let workersList = new workersListClass;
workers(BASE_PORT,ioWorkers, workersList);
clients(ioClients, workersList);

server.listen(BASE_PORT);
console.log('Master on port', BASE_PORT);