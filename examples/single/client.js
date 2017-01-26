/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('../commons/stream-generator/csvStream');
let clientLib = require('../../src/client/clientLib');
let exampleFunctions = require('../commons/functions/exampleFunctions');
if(process.argv.length != 4){
    console.error('Usage node client.js {master address} {seconds}');
    process.exit();
}

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
    exampleFunctions(client, rootKeys)//workers received (so property of next promise set)
        .then((type)=>client.workersConnectedPromise) //connected to all definitive workers
        .then(()=>csv.onData((data)=>client.sendWork(data))); //set the callback to send data
});


//TODO do a thing like worker communication delte for client
//TODO do a system to return data to client
//TODO recalibrate network during operation?
//TODO if master dies during transmision?
//TODO use const or let instead of var, use also use strict always