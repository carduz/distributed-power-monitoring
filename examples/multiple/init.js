/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('../commons/stream-generator/csvStream');
let pipeClient = require('./pipeClient').clientTerminal;
let pipeConfig = require('./pipeClient').configTerminal;
let utils = require('../../src/commons/utils');
if(process.argv.length != 5){
    console.error('Usage node init.js {master address} {seconds} {clients}');
    process.exit();
}

//TODO check if it is a number, since chars are recognized as 1
let numClients = parseInt(process.argv[4]);
if(numClients <= 0){
    console.error('clients must be >=1');
    process.exit();
}

let configDone = new utils.storePromise();
function onConfigData(data, stream){
    console.log(data);
    if(data == 'config_done') configDone.resolve();
}

function createClients(){
    let clients = [];
    for(let i = 0; i< numClients; i++)
        clients.push(pipeClient(process.argv[2]));
    return Promise.all(clients);
}

//TODO say that this is casually consistency

//get stream of data
let csv = csvStream(process.argv[3]);

//get header
Promise.all([
    csv.header,
    pipeConfig(process.argv[2], onConfigData),
    createClients(),
]).then(data=> { //set functions
    let keys = data[0];
    let configStream = data[1];
    let clients = data[2];

    //TODO stop stream and pipes if the connection is closed
    //get home numbers
    let rootKeys = Object.keys(keys).map(value=>value.split(' ')[1]);
    configStream.write({config: rootKeys});
    return Promise.all([
        configDone.promise, //we are sure that functions have been set
        clients
    ]);
}).then(data=>{ //send data
    let clients = data[1];
    let i = 0;
    //set the callback to send data
    csv.onData((data)=>{
        let client = clients[i++%numClients];
        client.write(data)
    });
});