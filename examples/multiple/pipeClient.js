/**
 * Created by claudio on 26/01/17.
 */
"use strict";
const client = require('../commons/process-pipe/client');
const spawn = require('child_process').spawn;
const crypto = require('crypto');

function getSock(){
    let hash = crypto.createHash('sha256');
    return hash.update(Math.random().toString()).digest('hex');
}

function connect(path, address, cbRead){
    cbRead = cbRead || ()=>{};
    let sock = getSock();
    spawn('gnome-terminal', ['-e', 'node '+__dirname+'/'+path+' '+address+' /tmp/power_'+sock+'.sock']);
    return client(sock, cbRead, 1000); //time to start terminal, we don't know when this occurs
}

module.exports.clientTerminal = (address, cbRead)=> {
    return connect('client.js', address, cbRead);
};
module.exports.configTerminal = (address, cbRead)=> {
    return connect('config.js', address, cbRead);
};