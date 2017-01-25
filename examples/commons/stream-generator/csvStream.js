/**
 * Created by claudio on 30/12/16.
 */
var csvParse = require('csv-parse');
var stream = require('stream');
var through2 = require('through2');
const spawn = require('child_process').spawn;
var csvParser = csvParse();
var Parser = require("jison").Parser;


function getStream(cb, name) {
    "use strict";
    name = name || '';
    let ws = new stream;
    ws.writable = true;
    ws.bytes = 0;

    ws.write = function (buf) {
        ws.bytes += buf.length;
        cb(buf);
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

function parseKeys(keys){
    "use strict";
    let grammar = {
        "lex": {
            "rules": [
                //["\\n",                      "return 'LINE';"],
                ["\\s+",                    "/* skip whitespace */"],
                ["[a-zA-Z0-9 ]+",           "return 'STRING';"],
                [",",                       "return 'COMMA';"],
                ["\\{",                     "return 'LB';"],
                ["\\}",                     "return 'RB';"],
                ["$",                       "return 'EOF';"]
            ]
        },

        "bnf": {
            "expressions" :[[ "objects EOF",   "return '{'+$1+'}';"  ]],

            /*"lines" : [
                ['object LINE line', "$$ = $1 +', '+ $3"],
                ['object line', "$$ = $1 +', '+ $2"],
                ['object LINE', "$$ = $1"],
                ['object', "$$ = $1"],
            ],*/
            "objects" : [
                ['object objects', "$$ = $1 +', '+ $2"],
                ['object', "$$ = $1"],
            ],

            "object" : [
                [ "STRING LB object_content RB",   "$$ = '\"'+$1.trim()+'\": {'+$3+'}';" ],
                [ "STRING LB last RB",   "$$ = '\"'+$1.trim()+'\": ['+$3+']';" ],
            ],

            "object_content" : [
                [ "object COMMA object_content",   "$$ = $1+', '+$3;" ],
                [ "object COMMA",   "$$ = $1;" ],
                [ "object",   "$$ = $1;" ],
            ],

            'last' : [
                [ "STRING COMMA last",   "$$ = '\"'+$1+'\", '+$3" ],
                [ "STRING COMMA",   "$$ = '\"'+$1+'\"';" ],
                [ "STRING",   "$$ = '\"'+$1+'\"';" ],
            ]
        }
    };

    let ret = {};
    try {
        let parser = new Parser(grammar);
        let parsed = parser.parse(keys);
        if (parsed)
            ret = JSON.parse(parsed);
    }catch(e)
    {
        console.error('Parser error', e.message);
    }
    return ret;
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
            let generator = spawn('java', ['-jar', __dirname+'/data-generator.jar', seconds]);
            let data = '';
            let solved = false;
            generator.stderr.pipe(getStream(chunk=>data+=chunk.toString(), 'header'));
            generator.stdout.pipe(csvParser)
                .pipe(locker(()=>{//lock data until the header is correctly set
                if(!solved){
                    solved = true;
                    resolve(parseKeys(data));
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
