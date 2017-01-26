/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let clientLib = require('../../src/client/clientLib');
let pipeServer = require('../commons/process-pipe/server');
if(process.argv.length != 4){
    console.error('Usage node client.js {master address} {pipe}');
    process.exit();
}


console.log('client');
//needed for inter-process communication
pipeServer(process.argv[3], (data)=>{
    console.log(data);
    //connect to client
    /*let client = new clientLib(process.argv[2]);

     //set functions
     client.setWorkersPending //workers received (so property of next promise set)
     .then((type)=>client.workersConnectedPromise) //connected to all definitive workers
     .then(()=>csv.onData((data)=>{client.sendWork(data)})); //set the callback to send data
     });*/
});