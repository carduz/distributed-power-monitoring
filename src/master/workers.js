/**
 * Created by claudio on 26/01/17.
 */
"use strict";
let functions = require('./setFunctions');

class Worker{
    constructor(client, ip, port) {
        this.client = client;
        this.ip = ip;
        this.port = port;
        this.order = 0;
        this.function = 'print';
        this.info = {};
        this.parameters = [];
        this.functionSetCB = function(){};
    }

    getAddress(){
        return 'http://'+this.ip+':'+this.port;
    }
}

module.exports = (basePort, ioWorkers)=> {
    //TODO do this thing based on real address, a sort of map realAddress -> portCounter
    let portCounter = basePort+1;
    ioWorkers.on('connection', (client)=> {
        let id = client.id;
        let port = 0;
        console.log('Worker connected', id);
        client.on('event', (data)=> {
        });
        client.on('disconnect', ()=> {
            console.log('Worker disconnected', id);
            //client.close(); //TODO why not work? do it for normal client?
            delete functions.workers[id];
            ioWorkers.emit('worker', 'delete', id);
        });

        client.on('function set', ()=> {
            functions.workers[id].functionSetCB(); //this way to call the new version of functionSetCB
        });

        client.on('worker', (ip)=> {
            port = portCounter++;
            let tmpWorker = new Worker(client, ip, port);

            //send already stored
            Object.keys(functions.workers).forEach(key=> {
                let worker = functions.workers[key];
                client.emit('worker', 'add', key, worker.getAddress());
            });

            functions.emitAllWorkers('worker', 'add', id, tmpWorker.getAddress());
            functions.workers[id] = tmpWorker;
            client.emit('port', {port: port, id: id});
            client.emit('function', functions.setFunction()(functions.workers[id]));
        });
    });
};