/**
 * Created by claudio on 26/01/17.
 */
"use strict";
let setFunctionsClass = require('./setFunctions');

module.exports = (ioClients, workers)=>{
    let clientWorkers = [];
    let setFunctions = new setFunctionsClass(workers);
    ioClients.on('connection', (client)=>{
        let id = client.id;
        console.log('Client connected', id);
        client.on('event', (data)=>{});
        client.on('disconnect', ()=>{
            console.log('Client disconnected', id);
            //client.close(); //TODO why not work? do it for normal client?
        });

        client.on('client',()=>{
            client.emit('workers', {type:'default', data: clientWorkers});
        });

        client.on('set-functions',(functions)=>{
            //this is a sort of Promise.all, the confirmation is given byu the worker via "function set"
            setFunctions.allFunctionsSet(()=>{
                clientWorkers = workers.addressesAtLevel(0);
                ioClients.emit('workers', {type: 'set', data:clientWorkers});
            });
            try {
                setFunctions.assignFunctions(functions);
            }catch(e){
                client.emit('custom-error', e.message);
                setFunctions.clearFunctionSetCb();
            }
        });
    });
};


