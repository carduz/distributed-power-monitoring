/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let utils = require('../commons/utils');
let client = require('socket.io-client');
module.exports = class{
    constructor(address) {
        this.socket = client(address);
        this.workers = [];
        this.setWorkersPending = new utils.storePromise();
        this.workersConnectedPromise = null;
        this.functionsSet = false;

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
            if(data.type == 'default' && this.functionsSet)
                return ;
            console.log('workers received');
            this.workersConnectedPromise = this.connectToWorkers(data.data);//.then(data=>this.sendWorks(data));//this way to stay in class context
            this.setWorkersPending.resolve();
        });
    }

    setFunctions(functions){
        this.functionsSet = true;
        this.setWorkersPending.fresh();
        this.socket.emit('set-functions', functions);
        return this.setWorkersPending.promise;
    }

    //TODO if this is call again before it is resolved the connections are taken two times (since the nex execution doens't know that there is an attempt. maybe there should be a register of attempts
    //TODO if connections fail?
    //TODO catch?
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
    sendWork(data){
        "use strict";
        this.worksStatus = this.worksStatus || 0;
        let i = this.worksStatus;
        let num = this.workers.length;
        this.workers[i++%num].connection.emit('job', data);
    }
};