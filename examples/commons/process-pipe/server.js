/**
 * Created by claudio on 26/01/17.
 */
"use strict";
var net = require('net');

module.exports = (sock, cb)=> {
    var server = net.createServer((stream) => {
        stream.on('data', (c) => {
            cb(c.toString());
        });
        stream.on('end', () => {
            server.close();
        });
    });
    server.listen(sock);
};