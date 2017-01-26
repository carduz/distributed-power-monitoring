/**
 * Created by claudio on 26/01/17.
 */
"use strict";
var net = require('net');
let streamWrapper = require('./streamWrapper');

module.exports = (sock, cb)=> {
    return new Promise((resolve, reject)=> {
        var server = net.createServer((stream) => {
            let wrapper = new streamWrapper(stream);
            wrapper.onData(cb);
            wrapper.onEnd(()=>server.close()); //the function is not passed to avoid context problems
            resolve(wrapper);
        });
        server.listen(sock);
    });
};