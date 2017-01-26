/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let utils = require('../commons/utils');
let client = require('socket.io-client');
module.exports = class{
    constructor(address, dataFunction) {
        this.socket = client(address);
        this.workers = [];
        this.setFunctionsPending = new utils.storePromise();
        this.dataFunction = dataFunction;

        this.socket.on('event', (data)=>{});
        this.socket.on('disconnect', ()=>{
            console.log('connection closed by the server');
            this.socket.close();
        });

        this.socket.on('connect', ()=>{
            console.log('connected');
            this.socket.emit('client');
        });

        this.socket.on('workers', (data)=>{
            console.log('workers received');
            if(data.type=='set')
                this.setFunctionsPending.resolve();
            this.connectToWorkers(data.data).then(data=>this.sendWorks(data));//this way to stay in class contex
        });
    }

    setFunctions(functions){
        this.setFunctionsPending.fresh();
        this.socket.emit('set-functions', functions);
        return this.setFunctionsPending.promise;
    }

    connectToWorkers(data){
        "use strict";
        return Promise.all(data.map((value)=>{
            let res = this.workers.filter((value2)=>{
                if(value2.address == value)
                    return true;
            });
            if(res.length)
                return Promise.resolve(res[0]);
            //TODO manage disconnection, retry reconnect?
            return utils.connectPromise(value);
        })).then((data)=>{
            this.workers=data;
            console.log('connected to workers');
        });

    }

    //TODO load balancer "worker"
    //TODO insert try...catch to avoid problems

    //TODO sync with init, don't recall on change workers but adapat itself
    //TODO how to get the answer? maybe the master should have a list of tasks
    //TODO close all at the end
    sendWorks(){
        "use strict";
        let i = 0;
        let num = this.workers.length;
        //TODO header in stderr
        this.dataFunction((record)=>{
            this.workers[i++%num].connection.emit('job', record);
        });
    }
};