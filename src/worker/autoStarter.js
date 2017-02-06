/**
 * Created by claudio on 06/02/17.
 */
"use strict";
const cpus = require('cpus');
const spawn = require('child_process').spawn;
let length = cpus().length;
if(process.argv.length != 4){
    console.error('Usage node worker.js {master address} {local ip}');
    process.exit();
}
for(let i = 0; i<length; i++)
    spawn('gnome-terminal', ['-e', 'node '+__dirname+'/worker.js '+process.argv[2]+' '+process.argv[3]]);
console.log('workers created');