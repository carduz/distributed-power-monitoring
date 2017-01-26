/**
 * Created by claudio on 26/01/17.
 */
"use strict";
let setFunctions = require('./setFunctions');

module.exports = (ioClients)=>{
    let clientWorkers = [];
    ioClients.on('connection', (client)=>{
        let id = client.id;
        console.log('Client connected', id);
        client.on('event', (data)=>{});
        client.on('disconnect', ()=>{
            console.log('Client disconnected', id);
            //client.close(); //TODO why not work? do it for normal client?
        });

        client.on('client',(functions)=>{
            client.emit('workers', {type:'default', data: clientWorkers});
        });

        client.on('set-functions',(functions)=>{
            //this is a sort of Promise.all
            //TODO we don't have a confirmation from workers
            setFunctions.allFunctionsSet(()=>{
                clientWorkers = Object.keys(setFunctions.workers).filter(key=>setFunctions.workers[key].order==0).map(key=>setFunctions.workers[key].getAddress());  //TODO bad way
                ioClients.emit('workers', {type: 'set', data:clientWorkers});
            });
            setFunctions.assignFunctions(functions);
        });
    });
};


