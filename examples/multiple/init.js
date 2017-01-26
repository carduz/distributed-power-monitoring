/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('../commons/stream-generator/csvStream');
let clientLib = require('../../src/client/clientLib');
let functionClass = require('../../src/client/function');
let pipeServer = require('../commons/process-pipe/server');
let pipeClient = require('../commons/process-pipe/client').clientTerminal;
if(process.argv.length != 5){
    console.error('Usage node init.js {master address} {seconds} {clients}');
    process.exit();
}

let clients = [];

pipeClient(process.argv[2]).then((stream)=>{
    clients.push(stream); //TODO a function that automaticall append \n or another delimiter
    writer.write('tttt');
    writer.write('tttt');
    writer.write('tttt');
});
/*
//get stream of data
let csv = csvStream(process.argv[3]);

//get header
csv.header.then(keys=> {
    //TODO stop stream if the connection is closed
    //get home numbers
    let rootKeys = Object.keys(keys).map(value=>value.split(' ')[1]);

    //connect to client
    let client = new clientLib(process.argv[2]);

    //set functions
    client.setFunctions([
        new functionClass('map', [mapper+";return mapper(arguments[0]);"]),
        new functionClass('shuffle', [], [rootKeys]),
        new functionClass('reduce', [reducer+";return reducer(arguments[0], arguments[1]);", uniqueKey+";return uniqueKey(arguments[0], arguments[1]);"]),
        new functionClass('print'),
    ])
        .then((type)=>client.workersConnectedPromise) //connected to all definitive workers
        .then(()=>csv.onData((data)=>{client.sendWork(data)})); //set the callback to send data
});


//TODO do a thing like worker communication delte for client
//TODO do a system to return data to client
//TODO recalibrate network during operation?
//TODO if master dies during transmision?
*/