/**
 * Created by claudio on 26/01/17.
 */
"use strict";
var net = require('net');
let streamWrapper = require('./streamWrapper');

module.exports = (sock, cb, time)=> {
    return new Promise((resolve, reject)=>setTimeout(()=> {
        let stream = net.connect('/tmp/power_' + sock + '.sock');
        let wrapper = new streamWrapper(stream);
        wrapper.onData(cb);
        resolve(wrapper);
    }, time || 0));
};