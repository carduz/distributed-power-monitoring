/**
 * Created by claudio on 30/12/16.
 */
"use strict";
class functionClass{
    constructor(setup, handler) {
        this._setup = setup || function(){};
        this._handler = handler || function(){return function(){}};
    }

    setup(functions, index, parameters){
        return this._setup(functions, index, parameters);
    }

    handler(worker, parameters){
        return this._handler(worker, parameters);
    }
    //TODO router
}


module.exports = {
    print: new functionClass(null, (worker, data)=>{
        "use strict";
        return (data)=> {
            console.log(worker, data);
        }
    }),
    shuffle: new functionClass((functions, index, parameters)=>{
        if(index>=(functions.length-1))
            return ;
        functions[functions.length-1].workers.forEach(value=>{
            value.info = parameters[0];
        });
    }, (worker, data, parameters)=>{
        "use strict";
        return (data)=> {
            console.log(worker, data, parameters);
        }
    }),
    map: new functionClass(null, (worker, parameters)=>{
        "use strict";
        let mapper = new Function(parameters[0]);
        return (data)=> {
            let original = data;
            let mapped = mapper(original);
            console.log('Mapper', original, mapped);
        }
    })
};