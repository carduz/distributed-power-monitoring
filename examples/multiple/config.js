/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let clientLib = require('../../src/client/clientLib');
let pipeServer = require('../commons/process-pipe/server');
let functionClass = require('../../src/client/function');
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
        config(data).then(()=>stream.write('config_done'));
}).then(stream=>{
    stream.onEnd(client.close);
});


//get header
function config(rootKeys){

    //set functions
    return client.setFunctions([
        new functionClass('map', [mapper + ";return mapper(arguments[0]);"]),
        new functionClass('shuffle', [], [rootKeys]),
        new functionClass('reduce', [reducer + ";return reducer(arguments[0], arguments[1]);", uniqueKey + ";return uniqueKey(arguments[0], arguments[1]);"]),
        new functionClass('print'),
    ]);
}

//"use strict" needed, since they are executed anonymously
function mapper(value){
    "use strict";
    let ret = {};
    ret.key = value[2];
    ret.value = value;
    return ret;
}
function reducer(key, value){
    "use strict";
    let means = {};
    let meansValues = {};
    let mean = 0;
    let percentage = 0;
    value.forEach(value=>{
        value = value['value'];
        let key = value[3]+'-'+value[4];
        means[key] = means[key] || {total:0, n:0};
        means[key].total += parseInt(value[5]);
        means[key].n++;
    });

    let keys = Object.keys(means);
    keys.forEach(key=> {
        //console.log(means[key]);
        let tmp = means[key].total / means[key].n;
        meansValues[key] = tmp;
        mean += tmp;
    });
    mean /= keys.length;

    {
        let greater = 0;
        keys.forEach(key=> {
            //console.log(meansValues[key], mean, greater);
            if(meansValues[key]>mean)
                greater++;
        });
        percentage = greater/keys.length;
        percentage = Math.round(percentage*100);
    }
    console.log(key+': percentage of plugs with mean higher than '+mean+' equal to: '+percentage+'%');
    return key+'='+percentage;
}

function uniqueKey(value, require){
    "use strict";
    //TODO no vlaid key
    let moment = require('moment');
    return value['key']+'-'+moment(value['value'][1]*1000).format('DD-MM-YYYY_HH');
}