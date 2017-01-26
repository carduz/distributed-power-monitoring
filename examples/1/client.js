/**
 * Created by claudio on 08/01/17.
 */
"use strict";
let csvStream = require('../commons/stream-generator/csvStream');
let clientLib = require('../../src/client/clientLib');
let functionClass = require('../../src/client/function');
if(process.argv.length != 4){
    console.error('Usage node client.js {master address} {seconds}');
    process.exit();
}
let csv = csvStream(process.argv[3]);
csv.header.then(keys=> {
    //TODO stop stream if the connection is closed
    let rootKeys = Object.keys(keys).map(value=>value.split(' ')[1]);
    let client = new clientLib(process.argv[2]);
    client.setFunctions([
        new functionClass('map', [mapper+";return mapper(arguments[0]);"]),
        new functionClass('shuffle', [], [rootKeys]),
        new functionClass('reduce', [reducer+";return reducer(arguments[0], arguments[1]);", uniqueKey+";return uniqueKey(arguments[0], arguments[1]);"]),
        new functionClass('print'),
    ])
        .then((type)=>client.workersConnectedPromise)
        .then(()=>csv.onData((data)=>{client.sendWork(data)}));
});

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


//TODO do a thing like worker communication delte for client
//TODO do a system to return data to client
//TODO recalibrate network during operation?
//TODO if master dies during transmision?