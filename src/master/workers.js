/**
 * Created by claudio on 26/01/17.
 */
"use strict";
let setFunctionsClass = require('./setFunctions');
let WorkerClass = require('./worker');

module.exports = (basePort, ioWorkers, workers)=> {
    //TODO do this thing based on real address, a sort of map realAddress -> portCounter
    let portCounter = basePort+1;
    let setFunctions = new setFunctionsClass(workers); //state object shared with master
    ioWorkers.on('connection', (client)=> {
        let id = client.id;
        let port = 0;
        console.log('Worker connected', id);
        client.on('event', (data)=> {
        });
        client.on('disconnect', ()=> {
            console.log('Worker disconnected', id);
            //client.close(); //TODO why not work? do it for normal client?
            workers.remove(id);
            ioWorkers.emit('worker', 'delete', id);
        });

        client.on('function set', ()=> {
            workers.get(id).functionSetCB(); //this way to call the new version of functionSetCB
        });

        client.on('worker', (ip)=> {
            port = portCounter++;
            let tmpWorker = new WorkerClass(client, ip, port);

            //send already stored
            workers.forEach((worker, key)=> {
                client.emit('worker', 'add', key, worker.getAddress());
            });

            ioWorkers.emit('worker', 'add', id, tmpWorker.getAddress());
            workers.add(tmpWorker);
            client.emit('port', {port: port, id: id});
            client.emit('function', setFunctions.setFunction()(workers.get(id)));
        });
    });
};