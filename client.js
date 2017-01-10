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
    clientLib(process.argv[2], [
        new functionClass('map', [mapper+";return mapper(arguments[0]);"]),
        new functionClass('print'),
        new functionClass('map', [mapper2+";return mapper2(arguments[0]);"]),
        //new functionClass('shuffle', [], [rootKeys]),
        new functionClass('print'),
    ], csv.onData);
});

function mapper(value){
    "use strict";
    let ret = {};
    ret[value[2]] = value;
    return ret;
}
function mapper2(value){
    "use strict";
    let ret = {};
    ret['A'] = 'test';
    return ret;
}


//TODO do a thing like worker communication delte for client
//TODO do a system to return data to client
//TODO recalibrate network during operation?
//TODO if master dies during transmision?