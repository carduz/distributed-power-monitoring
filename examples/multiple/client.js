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

//TODO promise connection, maybe to master is enough
let client = new clientLib(process.argv[2]);

//needed for inter-process communication
pipeServer(process.argv[3], (data)=>{
    console.log(data);
    client.sendWork(data);
}).then(stream=>{
    stream.onEnd(client.close);
});