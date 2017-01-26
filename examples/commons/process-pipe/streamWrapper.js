/**
 * Created by claudio on 26/01/17.
 */
"use strict";

module.exports = class {
    constructor(stream) {
        this._stream = stream;
        this._onEnd = [];
        this._stream.on('end', ()=>this._onEnd.forEach(onEnd => onEnd()));
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

    onEnd(cb){
        this._onEnd.push(cb);
    }

    write(data){
        return this._stream.write(JSON.stringify(data)+'||');
    }

    end(){
        return this._stream.end();
    }
};