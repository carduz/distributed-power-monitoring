/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('./csvStream');
let clientLib = require('./clientLib');
if(process.argv.length != 3){
    console.error('Usage node worker.js {master address}');
    process.exit();
}
clientLib(process.argv[2], ['print'], csvStream);