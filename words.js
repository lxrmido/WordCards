const config = require('./config.js');
const dict = require('./lib/dict.js');
const essay = require('./lib/essay.js');
const progress = require('./lib/progress.js');
const argv = require('yargs').argv;
const async = require('async');
const fs = require('fs');

if (!fs.existsSync(config.dict_db_file)) {
    console.log('Sqlite db file "' + config.dict_db_file + '" missing, please get it from "https://github.com/skywind3000/ECDICT/releases"');
} else if (!argv.src) {
    console.log('Missing arguments: src');
    console.log('Example: node words --src=example.txt');
} else {
    /*
     * Load args
     * --src, --dst, --level, --length, --ignore, --append
     */
    var src = argv.src;
    var dst = config.words_json_file;
    var level = 1;
    var length = 2;
    var ignore = 0;
    var notFoundCount = 0;
    var skipedCount = 0;
    var ignoredCount = 0;
    var append = false;
    if (argv.dst) {
        dst = argv.dst;
    }
    if (argv.level > 0) {
        level = parseInt(argv.level);
    }
    if (argv.length > 0) {
        length = parseInt(argv.length);
    }
    if (argv.ignore > 0) {
        ignore = parseInt(argv.ignore);
    }
    if (argv.append == 'true') {
        append = true;
    }

    console.log('Words from:' + src);

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
                    notFoundCount ++;
                    console.log('NotFound:' + word);
                    return callback();
                }
                try{
                    explain = JSON.parse(JSON.stringify(explain));
                }catch(e){
                    notFoundCount ++;
                    console.log(e);
                    return callback();
                }
                if (word.length < length) {
                    skipedCount ++;
                    console.log('Skip by length:' + word);
                    return callback();
                }
                if (!inLevel(explain, level)) {
                    skipedCount ++;
                    console.log('Skip by level:' + word);
                    return callback();
                }
                explain.times = map[word].times;
                explain.context = map[word].context;
                if (ignore > 0) {
                    progress.getWord(explain.word, (err, wordProgress) => {
                        if (wordProgress) {
                            if (ignore > 2) {
                                ignoredCount ++;
                                console.log('Ignored:' + word);
                                return callback();
                            }
                            if (ignore > 1) {
                                if (wordProgress.star === 0) {
                                    ignoredCount ++;
                                    console.log('Ignored:' + word);
                                    return callback();
                                } else {
                                    dstArray.push(explain);
                                    return callback();
                                }
                            }
                            if (wordProgress.ignore === 1) {
                                ignoredCount ++;
                                console.log('Ignored:' + word);
                                return callback();
                            }
                        }
                        dstArray.push(explain);
                        return callback();
                    }, 1, false);
                } else {
                    dstArray.push(explain);
                    return callback();
                }
            });
        }, (err) => {
            let targetArray = dstArray;
            if (err) {
                console.log(err);
            }
            if (append) {
                if (fs.existsSync(dst)) {
                    targetArray = [];
                    let srcArray = JSON.parse(fs.readFileSync(dst));
                    let wordMap = {};
                    let duplicated = 0;
                    srcArray.forEach((x) => {
                        targetArray.push(x);
                        wordMap[x.word] = x;
                    });
                    dstArray.forEach((x) => {
                        if (wordMap[x.word]) {
                            duplicated ++;
                            if (wordMap[x.word].times && x.times) {
                                wordMap[x.word].times += x.times;
                            }
                        } else {
                            targetArray.push(x);
                        }
                    });
                    console.log('Duplicated: ' + duplicated);
                    console.log('Appended: ' + (dstArray.length - duplicated));
                }
            }
            console.log('NotFound: ' + notFoundCount);
            console.log('Skiped: ' + skipedCount);
            console.log('Ignored: ' + ignoredCount);
            console.log(targetArray.length + ' words had been written to file: ' + dst + '.');
            fs.writeFileSync(dst, JSON.stringify(targetArray));
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
