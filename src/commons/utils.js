/**
 * Created by claudio on 09/01/17.
 */
"use strict";
let client = require('socket.io-client');

module.exports.connectPromise = (address)=>{
        return new Promise((resolve, reject)=> {
            let clientIO = client(address);
            clientIO.on('connect', ()=> {
                resolve({address: address, connection: clientIO});
            });
        });
    };

module.exports.storePromise = class {
    constructor() {
        this.fresh();
    }

    fresh(){
        this._promise = new Promise((resolve, reject)=>{
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    get promise(){
        return this._promise;
    }

    resolve(data){
        return this._resolve(data);
    }

    reject(data){
        return this._reject(data);
    }
};