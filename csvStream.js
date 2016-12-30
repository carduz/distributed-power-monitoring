/**
 * Created by claudio on 30/12/16.
 */
var parse = require('csv-parse');
var parser = parse();

var fs = require('fs');
var transform = require('stream-transform');
module.exports = function(recordCallback) {
    var transformer = transform(function (record, callback) {
//    setTimeout(function(){
        recordCallback(record);
        callback(null, record.join(' ') + '\n');
        //  }, 500);
    }, {parallel: 10});
    process.stdin.pipe(parser).pipe(transformer);//.pipe(process.stdout);
}