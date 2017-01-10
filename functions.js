/**
 * Created by claudio on 30/12/16.
 */
"use strict";
function standardRouter(worker, functions, index){
    let i = 0;
    if(index>=(functions.length-1)) //is the last
        return function(){};

    let workers = functions[index+1].workers;
    let num = workers.length;
    return (nextData)=>{
        return workers[i++%num];
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
        functions[index+1].workers.forEach(value=>{
            value.info = parameters[0];
        });
    }, (worker, data, parameters)=>{
        "use strict";
        return (data)=> {
            console.log('Shuffle', data);
            return data;
        }
    }, (worker, functions, index)=>{
        if(index>=(functions.length-1)) //is the last
            return function(){};

        let workers = functions[index+1].workers;
        let num = workers.length;
        //TODO
        /*
        * Assign keys in setup
        * Can a key be assigned to more than one reducer?
        * If yes do i%num system for each key
         * nextData can have more than one key, so Object.keys must be used
         */
        return (nextData)=> {
            return workers[i++ % num];
        }
    }),
    map: new functionClass(null, (worker, parameters)=>{
        "use strict";
        let mapper = new Function(parameters[0]);
        return (data)=> {
            let original = data;
            let mapped = mapper(original);
            console.log('Mapper', original, mapped);
            return mapped;
        }
    })
};