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
    //get home numbers
    let rootKeys = Object.keys(keys).map(value=>value.split(' ')[1]);

    //connect to client
    let client = new clientLib(process.argv[2]);
    //csv.onClose(()=>client.close()); //TODO fix, this doens't work for small time (the connection is not established yet)
    client.onClose(csv.kill());

    //set functions
    exampleFunctions(client, rootKeys)//workers received (so property of next promise set)
        .then((type)=>client.workersConnectedPromise) //connected to all definitive workers
        .then(()=>csv.onData((data)=>client.sendWork(data))); //set the callback to send data
});


//TODO recalibrate network during operation?
//TODO if master dies during transmision?
//TODO use const or let instead of var, use also use strict always