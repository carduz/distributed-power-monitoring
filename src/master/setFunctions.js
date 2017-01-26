/**
 * Created by claudio on 26/01/17.
 */
"use strict";
let functions = require('../commons/functions');

module.exports = class {

    constructor(workers) {
        this.workers = workers;
    }

    setAllFunctions(functions){
        this.emitAllWorkers('function', this.setFunction(functions));
    }

    emitAllWorkers(channel, msg){
        "use strict";
        msg = msg || '';
        this.workers.forEach((value)=>{
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

    assignFunctions(functionsNames){
        let functionsWithWorkers = [];
        if(this.workers.length < functionsNames.length)
            throw new Error('Insufficient workers');//TODO emit to client, don't kill everything

        functionsWithWorkers = functionsNames.map(value=>{return {functionName: value, workers: []};});
        //assign workers, if the number of workers per function is not the same priority is given to the firsts functions
        this.workers.forEach((value, key, i)=>{
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

        this.setAllFunctions(functionsWithWorkers);
    }

    setFunction(functions){
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

    //TODO what if this is called again before the previous is completed?
    allFunctionsSet(cb) {
        let toConsume = this.workers.keys;
        this.workers.forEach((worker, key)=>{
            worker.functionSetCB = ()=>{
                let position = toConsume.indexOf(key);
                if(position>=0)
                    toConsume.splice(position,1);
                if(!toConsume.length)
                    cb();
            }
        });
    }
};