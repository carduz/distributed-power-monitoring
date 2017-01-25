/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let server = require('http').createServer();
let io = require('socket.io')(server);
let functions = require('../commons/functions');
const BASE_PORT = 3000;

let workers = {};
class Worker{
    constructor(client, port) {
        this.client = client;
        this.port = port;
        this.order = 0;
        this.function = 'print';
        this.info = {};
        this.parameters = [];
        this.functionSetCB = function(){};
    }

    getAddress(){
        return 'http://localhost:'+this.port;
    }
}

//TODO do this thing based on real address, a sort of map realAddress -> portCounter
let portCounter = BASE_PORT+1;
io.on('connection', (client)=>{
    let id = client.id;
    let worker = false;
    let port = 0;
    console.log('Client connected', id);
    client.on('event', (data)=>{});
    client.on('disconnect', ()=>{
        console.log('Client disconnected', id);
        //client.close(); //TODO why not work? do it for normal client?
        if(worker) {
            delete workers[id];
            emitAllWorkers('worker', 'delete', id);
        }
    });
    client.on('worker',()=>{
        worker = true;
        port = portCounter++;
        let tmpWorker = new Worker(client, port);

        //send already stored
        Object.keys(workers).forEach(key=>{
            let worker = workers[key];
            client.emit('worker', 'add', key, worker.getAddress());
        });

        emitAllWorkers('worker', 'add', id, tmpWorker.getAddress());
        workers[id] = tmpWorker;
        client.emit('port', {port:port, id: id});
        client.emit('function', setFunction()(workers[id])); //set function in a bad way
    });
    client.on('function set',()=> {
        workers[id].functionSetCB(); //this way to call the new version of functionSetCB
    });

    client.on('client',(functions)=>{
        //this is a sort of Promise.all
        allFunctionsSet(()=>{
            client.emit('workers', Object.keys(workers).filter(key=>+workers[key].order==0).map(key=>workers[key].getAddress())); //bad way
        });
        assignFunctions(functions);
    });
});

server.listen(BASE_PORT);
console.log('Master on port', BASE_PORT);


function allFunctionsSet(cb) {
    let toConsume = Object.keys(workers);
    Object.keys(workers).forEach((key)=>{
        workers[key].functionSetCB = ()=>{
            let position = toConsume.indexOf(key);
            if(position>=0)
                toConsume.splice(position,1);
            if(!toConsume.length)
                cb();
        }
    });
}

function emitAllWorkers(channel, msg){
    "use strict";
    msg = msg || '';
    Object.keys(workers).forEach((key)=>{
        let value = workers[key];
        let parameters = [];
        parameters.push(channel);
        let data = '';
        if(typeof msg == 'function')
            data = msg(value);
        else
            data = msg;
        if(Array.isArray(data))
            parameters = parameters.concat(data);
        else
            parameters.push(data);
        parameters = parameters.concat(Array.prototype.slice.call(arguments, 2));
        value.client.emit.apply(value.client, parameters);
    });
}

function assignFunctions(functionsNames){
    let functionsWithWorkers = [];
    if(Object.keys(workers).length < functionsNames.length)
        throw new Error('Insufficient workers');//TODO emit to client, don't kill everything

    functionsWithWorkers = functionsNames.map(value=>{return {functionName: value, workers: []};});
    //assign workers, if the number of workers per function is not the same priority is given to the firsts functions
    Object.keys(workers).forEach((key, i)=>{
        let value = workers[key];
        let order = i%functionsWithWorkers.length;
        let functionObj = functionsWithWorkers[order];
        functionObj.workers.push(value);
        value.order = order;
        value.parameters = functionObj.functionName.handlerParameters;
        value.function = functionObj.functionName.name;
    });

    //call setup
    functionsWithWorkers.forEach((value,key)=>{
        try{
            functions[value.functionName.name].setup(functionsWithWorkers, key, value.functionName.setupParameters);
        }catch(e)
        {
            console.error(e.stack);
        }
    });

    setAllFunctions(functionsWithWorkers);
}

function setAllFunctions(functions){
    emitAllWorkers('function', setFunction(functions));
}

function setFunction(functions){
    functions = functions || [];
    functions = functions.map(value=>{
        let ret = value;
        ret.workers = value.workers.map(worker=>{
            return {id: worker.client.id, info: worker.info}
        });
        return ret;
    });
    return function(worker) {
        return {"function": worker.function, info: worker.info, order: worker.order, parameters: worker.parameters, functions: functions};
    }
}