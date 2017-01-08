/**
 * Created by claudio on 30/12/16.
 */
var parse = require('csv-parse');
var stream = require('stream');
var parser = parse();

var fs = require('fs');


function getStream(cb) {
    var ws = new stream;
    ws.writable = true;
    ws.bytes = 0;

    ws.write = function (buf) {
        ws.bytes += buf.length;
        cb(buf.toString());
    };

    ws.end = function (buf) {
        console.log(arguments.length);
        if (arguments.length) ws.write(buf);
        ws.writable = false;

        console.log('bytes length: ' + ws.bytes);
    };
    return ws;
}

module.exports =
    function (seconds) {
        const spawn = require('child_process').spawn;
        var generator = null;
        return function (recordCallback) {
            if(generator === null)
                generator = spawn('java', ['-jar', 'data-generator.jar', seconds]);
            generator.stdout.pipe(parser).pipe(getStream(recordCallback));
        };
    };
