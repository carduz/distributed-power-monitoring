/**
 * Created by claudio on 30/12/16.
 */
"use strict";
class functionClass{
    constructor(setup, handler) {
        this._setup = setup || function(){};
        this._handler = handler || function(){};
    }

    setup(functions, index, parameters){
        return this._setup(functions, index, parameters);
    }

    handler(worker, data, parameters){
        return this._handler(worker, data, parameters);
    }
    //TODO router
}


module.exports = {
    print: new functionClass(null, (worker, data)=>{
        "use strict";
        console.log(worker, data);
    }),
    shuffle: new functionClass((functions, index, parameters)=>{
        if(index>=(functions.length-1))
            return ;
        functions[functions.length-1].workers.forEach(value=>{
            value.info = parameters[0];
        });
    }, (worker, data, parameters)=>{
        "use strict";
        console.log(worker, data, parameters);
    }),
    map: new functionClass(null, (worker, data, parameters)=>{
        "use strict";
        let original = data;
        let mapper = new Function(parameters[0]);
        let mapped = mapper(original);
        console.log('Mapper', original, mapped);
    })
};