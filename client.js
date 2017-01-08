/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('./csvStream');
let clientLib = require('./clientLib');
let functionClass = require('./function');
if(process.argv.length != 4){
    console.error('Usage node client.js {master address} {seconds}');
    process.exit();
}
let csv = csvStream(process.argv[3]);
csv.header.then(keys=> {
    //console.log('keys', keys);
    let rootKeys = Object.keys(keys);
    clientLib(process.argv[2], [new functionClass('shuffle', [rootKeys], [rootKeys]), new functionClass('print')], csv.onData);
});