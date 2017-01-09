/**
 * Created by claudio on 09/01/17.
 */
"use strict";
let client = require('socket.io-client');

module.exports ={
    connectPromise(address){
        return new Promise((resolve, reject)=> {
            let clientIO = client(address);
            clientIO.on('connect', ()=> {
                resolve({address: address, connection: clientIO});
            });
        });
    }
}