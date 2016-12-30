/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let client = require('socket.io-client');
if(process.argv.length != 3){
    console.error('Usage node worker.js {master address}');
    process.exit();
}

let socket = client(process.argv[2]);

socket.on('event', (data)=>{});
socket.on('disconnect', ()=>{
    console.log('connection closed by the server');
    socket.close();
});

socket.on('connect', ()=>{
    console.log('connected');
    socket.emit('client', ['print']);
});

let workers = [];
socket.on('workers', (data)=>{
    console.log('workers received');
    connectToWorkers(data).then(sendWorks);
});

function connectToWorkers(data){
    "use strict";
    return Promise.all(data.map((value)=>{
        let res = workers.filter((value2)=>{
           if(value2.address == value)
               return true;
        });
        if(res.length)
            return Promise.resolve(res[0]);
        return connectPromise(value);
    })).then((data)=>{
        workers=data;
        console.log('connected to workers');
    });

}

//TODO load balancer "worker"
//TODO insert try...catch to avoid problems

//TODO sync with init, don't recall on change workers but adapat itself
function sendWorks(){
    "use strict";
    let i = 0;
    let num = workers.length;
    emulateLongStreaming((job)=>{
        workers[i++%num].connection.emit('job', job);
    });
}

let jobs = [
    '5',
    'test',
    '9',
    'test3'
];
function emulateLongStreaming(callback, jobId){
    "use strict";
    jobId = jobId || 0;
    if(jobId<jobs.length)
        setTimeout(()=>{
            callback(jobs[jobId]);
                emulateLongStreaming(callback, jobId+1);
        },1000);
}

//TODO manage disconnection
function connectPromise(address){
    return new Promise((resolve, reject)=> {
        let clientIO = client(address);
        clientIO.on('connect', ()=> {
            resolve({address: address, connection: clientIO});
        });
    });
}