/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('./csvStream');
let clientLib = require('./clientLib');
if(process.argv.length != 4){
    console.error('Usage node client.js {master address} {seconds}');
    process.exit();
}
clientLib(process.argv[2], ['print'], csvStream(process.argv[3]));