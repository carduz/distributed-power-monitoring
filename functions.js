/**
 * Created by claudio on 30/12/16.
 */
"use strict";
let debounce = require('debounce');
let config = require('./config');

function standardRouter(worker, functions, index){
    let i = 0;
    if(index>=(functions.length-1)) //is the last
        return function(){};

    let workers = functions[index+1].workers;
    let num = workers.length;
    return (nextData)=>{
        return workers[i++%num].id;
    };
}

class functionClass{
    constructor(setup, handler, router) {
        this._setup = setup || function(){};
        this._handler = handler || function(){return function(data){return data;}};
        this._router = router || standardRouter;
    }

    setup(functions, index, parameters){
        return this._setup(functions, index, parameters);
    }

    handler(worker, parameters){
        return this._handler(worker, parameters);
    }

    router(worker, functions, index){
        return this._router(worker, functions, index);
    }
}


module.exports = {
    print: new functionClass(null, (worker, data)=>{
        "use strict";
        return (data)=> {
            console.log('Printer', data);
            return data;
        }
    }),
    shuffle: new functionClass((functions, index, parameters)=>{
        if(index>=(functions.length-1))
            return ;
        let workers = functions[index+1].workers;
        let keys = parameters[0];
        //TODO if there are too few keys?
        //TODO if there are no keys? better solution that idle workers?
        let keysPerWorker = Math.floor(keys.length/workers.length);
        if(keysPerWorker<1)
            keysPerWorker = 1;
        workers.forEach(value=>{
            value.info.keys = keys.splice(0, Math.min(keysPerWorker, keys.length));
        });
    }, (worker, data, parameters)=>{
        "use strict";
        return (data)=> {
            if(!config.silent)
                console.log('Shuffle', data);
            return data;
        }
    }, (worker, functions, index)=>{
        if(index>=(functions.length-1)) //is the last
            return function(){};

        let workers = functions[index+1].workers;
        let workersByKey = {};

        workers.forEach(worker=>{
            worker.info.keys.forEach(key=>{
               workersByKey[key] = worker;
           });
        });
        return (nextData)=> {
            //TODO return errors to client
            if(nextData.key == undefined) throw new Error("key not found in data");
            let tmp = workersByKey[nextData.key];
            if(tmp == undefined) throw new Error("Worker for key '"+nextData.key+"' not found");
            return tmp.id;
        }
    }),
    map: new functionClass(null, (worker, parameters)=>{
        "use strict";
        let mapper = new Function(parameters[0]); //TODO default
        return (data)=> {
            let original = data;
            let mapped = mapper(original);
            if(!config.silent)
                console.log('Mapper', original, mapped);
            return mapped;
        }
    }),
    reduce: new functionClass(null, (worker, parameters)=>{
        "use strict";
        let reducer = new Function(parameters[0]); //TODO default
        let uniqueKey = new Function(parameters[1]); //TODO default
        let windowSize = parameters[2]||1000; //ms
        let debounces = {};
        let buffer = {};
        let processed = [];
        return (data)=> {
            let key = uniqueKey(data, require);
            if(processed.indexOf(key)>=0)
                return ;
            buffer[key] = buffer[key] || [];
            buffer[key].push(data);
            debounces[key] = debounces[key] || debounce(()=>{
                try {
                    processed.push(key);
                    let original = buffer[key];
                    let reduced = reducer(key, original);
                    if(!config.silent)
                        console.log('Reducer', reduced);
                    delete buffer[key];
                    delete debounces[key];
                    //TODO return to something, if next node?
                }catch(e)
                {
                    console.error(e.stack);
                }
                }, windowSize);
            debounces[key]();
            return '';
        }
    })
};