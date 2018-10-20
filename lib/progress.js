const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const fs = require('fs');

if (!fs.existsSync(config.progress_db_file)) {
    fs.copyFileSync('resource/db/progress.db', config.progress_db_file);
}

var db = new sqlite3.Database(config.progress_db_file, sqlite3.OPEN_READWRITE, (e) => {
    if (e) {
        console.log(e);
    }
});

var vars = {};

if (fs.existsSync(config.progress_json_file)) {
    vars = JSON.parse(fs.readFileSync(config.progress_json_file));
}

checkVarsInitialValues();

function checkVarsInitialValues(){
    var defaultVars = {
        index: 0,
        hk_prev: [37, 40, 33],
        hk_next: [38, 39, 34],
        hk_star: [],
        hk_ignore: [],
        cfg_delay: 0
    };
    Object.keys(defaultVars).forEach((x) => {
        if (!(x in vars)) {
            vars[x] = JSON.parse(JSON.stringify(defaultVars[x]));
        }
    });
}

function save(){
    return fs.writeFileSync(config.progress_json_file, JSON.stringify(vars));
}

function getWord(word, callback, retry = 3, addIfNotExists = true){
    db.get('select * from progress where word=?', [word], (err, row) => {
        if (err) {
            callback && callback(err, null);
        } else {
            if (row) {
                callback && callback(null, {
                    word: row.word,
                    times: row.times,
                    ignore: row.ignore,
                    star: row.star
                });
            } else {
                if (addIfNotExists) {
                    addWord(word, (err) => {
                        if (err) {
                            callback && callback(err, null);
                        } else {
                            if (retry > 0) {
                                getWord(word, callback, retry - 1, addIfNotExists);
                            } else {
                                callback && callback('Insert failed.');
                            }
                        }
                    })
                } else {
                    callback(null, null);
                }
            }
        }
    });
}

function addWord(word, callback){
    db.run('insert into progress (word, times, ignore, star) values (?, ?, ?, ?)', [word, 0, 0, 0], (err) => {
        if (err) {
            callback && callback(err);
        } else {
            callback && callback();
        }
    });
}

function saveWord(data, callback){
    db.run('update progress set times=?, ignore=?, star=? where word=?', [data.times, data.ignore, data.star, data.word], (err) => {
        if (err) {
            callback && callback(err);
        } else {
            callback && callback();
        }
    });
}

module.exports = {
    vars: vars,
    getWord: getWord,
    putWord: saveWord,
    save: save
};