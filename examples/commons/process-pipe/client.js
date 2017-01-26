/**
 * Created by claudio on 26/01/17.
 */
"use strict";
var net = require('net');
const spawn = require('child_process').spawn;
const crypto = require('crypto');

let client = (sock, time)=> {
    return new Promise((resolve, reject)=>setTimeout(()=> {
        var stream = net.connect('/tmp/power_' + sock + '.sock');
        resolve(stream);
    }, time || 0));
};


module.exports.client = client;
module.exports.clientTerminal = (address)=> {
    let hash = crypto.createHash('sha256');
    let sock = hash.update(Math.random().toString()).digest('hex');
    spawn('gnome-terminal', ['-e', 'node '+__dirname+'/../../multiple/client.js '+address+' /tmp/power_'+sock+'.sock']);
    return client(sock, 1000); //time to start terminal, we don't know when this occurs
};