/**
 * Created by claudio on 30/12/16.
 */
"use strict";
class functionClass{
    constructor(setup, handler) {
        this._setup = setup || function(){};
        this._handler = handler || function(){};
    }

    setup(){
        return this._setup();
    }

    handler(worker, data, parameters){
        console.log(this);
        return this._handler(worker, data, parameters);
    }
}


module.exports = {
    print: new functionClass(null, (worker, data)=>{
        "use strict";
        console.log(worker, data);
    }),
    shuffle: new functionClass(null, (worker, data, parameters)=>{
        "use strict";
        console.log(worker, data, parameters);
    })
};