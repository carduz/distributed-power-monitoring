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
            stream.on('end', () => {
                server.close();
            });
            resolve(wrapper);
        });
        server.listen(sock);
    });
};