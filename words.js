const config = require('./config.js');
const dict = require('./lib/dict.js');
const essay = require('./lib/essay.js');
const argv = require('yargs').argv;
const async = require('async');
const fs = require('fs');

if (!fs.existsSync(config.dict_db_file)) {
    console.log('Sqlite db file "' + config.dict_db_file + '" not found, please get it from "https://github.com/skywind3000/ECDICT/releases"');
} else if (!argv.src) {
    console.log('Missing arguments: src');
    console.log('Example: node words --src=example.txt');
} else {
    var src = argv.src;
    var dst = config.words_json_file;
    var level = 1;
    var length = 2;
    console.log('Words from:' + src);
    if (argv.dst) {
        dst = argv.dst;
    }
    if (argv.level > 0){
        level = parseInt(argv.level);
    }
    if (argv.length > 0){
        length = parseInt(argv.length);
    }
    essay.extract(src, (err, map) => {
        if (err) {
            console.log(err);
            return;
        }
        let dstArray = [];
        async.map(Object.keys(map), (word, callback) => {
            dict.get(word, (err, explain) => {
                if (err) {
                    console.log(err);
                    return callback();
                }
                if (!explain) {
                    console.log('NotFound:' + word);
                    return callback();
                }
                try{
                    explain = JSON.parse(JSON.stringify(explain));
                }catch(e){
                    console.log(e);
                    return callback();
                }
                if (word.length < length) {
                    console.log('Skip by length:' + word);
                    return callback();
                }
                if (!inLevel(explain, level)) {
                    console.log('Skip by level:' + word);
                    return callback();
                }
                explain.times = map[word].times;
                explain.context = map[word].context;
                dstArray.push(explain);
                callback();
            });
        }, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(dstArray.length + ' words had been written to file: ' + dst + '.');
            fs.writeFileSync(dst, JSON.stringify(dstArray));
        });
    });
}

function inLevel (explain, level) {
    if (level === 1) {
        return true;
    }
    if (!explain.tag) {
        return true;
    }
    if (explain.tag.indexOf('zk') >= 0) {
        return false;
    }
    if (explain.tag.indexOf('gk') >= 0) {
        return false;
    }
    if (explain.tag.indexOf('cet4') >= 0) {
        return false;
    }
    if (level < 3) {
        return true;
    }
    if (explain.tag.indexOf('cet6') >= 0) {
        return false;
    }
    if (level < 4) {
        return true;
    }
    if (explain.collins && explain.collins > 2) {
        return false;
    }
    return true;
}
