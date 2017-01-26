/**
 * Created by claudio on 26/01/17.
 */
"use strict";

module.exports = class {

    constructor(stream) {
        this._stream = stream;
    }

    get stream(){
        return this._stream;
    }

    onData(cb){
        this._stream.on('data', (c) => {
            let data = c.toString().split('||');
            data.forEach((data)=> {
                if(data.trim() == '')
                    return ;
                try {
                    data = JSON.parse(data);
                    cb(data, this);
                } catch (e) {
                    console.error(e.stack);
                }
            });
        });
    }

    write(data){
        return this._stream.write(JSON.stringify(data)+'||');
    }

    end(){
        return this._stream.end();
    }
}