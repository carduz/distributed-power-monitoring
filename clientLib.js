/**
 * Created by claudio on 30/12/16.
 */
"use strict";
module.exports = function (address, functions, dataFuntion) {
    let client = require('socket.io-client');

    let socket = client(address);

    socket.on('event', (data)=>{});
    socket.on('disconnect', ()=>{
        console.log('connection closed by the server');
        socket.close();
    });

    socket.on('connect', ()=>{
        console.log('connected');
        socket.emit('client', functions);
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
    //TODO how to get the answer? maybe the master should have a list of tasks
    //TODO close all at the end
    function sendWorks(){
        "use strict";
        let i = 0;
        let num = workers.length;
        //TODO header in stderr
        dataFuntion((record)=>{
            workers[i++%num].connection.emit('job', record);
        });
    }

    //TODO manage disconnection, retry reconnect?
    function connectPromise(address){
        return new Promise((resolve, reject)=> {
            let clientIO = client(address);
            clientIO.on('connect', ()=> {
                resolve({address: address, connection: clientIO});
            });
        });
    }
};