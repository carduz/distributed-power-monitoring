/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let clientLib = require('../../src/client/clientLib');
let pipeServer = require('../commons/process-pipe/server');
let exampleFunctions = require('../commons/functions/exampleFunctions');
if(process.argv.length != 4){
    console.error('Usage node config.js {master address} {pipe}');
    process.exit();
}

console.log('config');

//TODO close when init is closed
//connect to client
let client = new clientLib(process.argv[2], false);

pipeServer(process.argv[3], (data, stream)=> {
    if(data.config != undefined)
        exampleFunctions(client, data.config).then(()=>stream.write('config_done'));
}).then(stream=>{
    stream.onEnd(client.close);
});
