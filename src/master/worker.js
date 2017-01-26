/**
 * Created by claudio on 26/01/17.
 */
"use strict";
module.exports = class {
    constructor(client, ip, port) {
        this.client = client;
        this.ip = ip;
        this.port = port;
        this.order = 0;
        this.function = 'print';
        this.info = {};
        this.parameters = [];
        this.functionSetCB = function(){};
    }

    getAddress(){
        return 'http://'+this.ip+':'+this.port;
    }
};
