/**
 * Created by claudio on 30/12/16.
 */
var parse = require('csv-parse');
var stream = require('stream');
var through2 = require('through2');
const spawn = require('child_process').spawn;
var parser = parse();


function getStream(cb, name) {
    "use strict";
    name = name || '';
    let ws = new stream;
    ws.writable = true;
    ws.bytes = 0;

    ws.write = function (buf) {
        ws.bytes += buf.length;
        cb(buf.toString());
    };

    ws.end = function (buf) {
        if (arguments.length) ws.write(buf);
        ws.writable = false;

        console.log(name, 'bytes length: ' + ws.bytes);
    };
    return ws;
}

function locker(cb, promise){
    "use strict";
    let unlocked = false;
    return through2.obj(function(chunk, enc, callback) {
        var stream = this;
        cb();
        if (!unlocked) {
            promise.then(()=>{
                unlocked = true;
                stream.push(chunk);
                callback();
            });
        } else {
            stream.push(chunk);
            callback();
        }
    });
}

module.exports =
    function (seconds) {
        "use strict";
        let recordCallback = function(){};
        let lockPromise = {};
        lockPromise.promise = new Promise((resolve, reject)=>{
            "use strict";
            lockPromise.resolve = resolve;
            lockPromise.reject = reject;
        });
        return {header: new Promise((resolve, reject)=>{
            "use strict";
            let generator = spawn('java', ['-jar', 'data-generator.jar', seconds]);
            let data = '';
            let solved = false;
            generator.stderr.pipe(getStream(chunk=>data+=chunk, 'header'));
            generator.stdout.pipe(parser).pipe(locker(()=>{
                if(!solved){
                    solved = true;
                    resolve(data);
                }
            }, lockPromise.promise))
                .pipe(getStream(record=>recordCallback(record), 'data')); //this way to call the new version of recordCallback
        }),
            onData: function(cb){
                "use strict";
                recordCallback = cb;
                lockPromise.resolve();
            }
        };
    };
