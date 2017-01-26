/**
 * Created by claudio on 26/01/17.
 */
"use strict";
module.exports = class {

    constructor() {
        this._workers = {};
    }

    add(worker){
        this._workers[worker.client.id] = worker;
    }

    get(key){
        return this._workers[key];
    }

    remove(key){
        delete this._workers[key];
    }

    forEach(cb){
        let i = 0;
        Object.keys(this._workers).forEach(key=> {
            let worker = this.get(key);
            cb(worker, key, i++);
        });
    }

    toList(){
        let ret = [];
        this.forEach(worker => ret.push(worker));
        return ret;
    }

    filter(cb){
        let ret = [];
        this.forEach((worker, key, pos) => {
            if(cb(worker, key, pos))
                ret.push(worker);
        });
        return ret;
    }

    map(cb){
        let ret = [];
        this.forEach((worker, key, pos) => {
            ret.push(cb(worker, key, pos));
        });
        return ret;
    }

    addressesAtLevel(level){
        level = level || 0;
        return this
            .filter(worker=>worker.order==level)
            .map(worker=>worker.getAddress());

    }

    get workers(){
        return this.toList();
    }

    get length(){
        return this.workers.length;
    }

    get keys(){
        return Object.keys(this._workers);
    }
};