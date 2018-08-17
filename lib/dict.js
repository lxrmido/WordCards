const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
var db = new sqlite3.Database(config.dict_db_file, sqlite3.OPEN_READONLY, (e) => {
    if (e) {
        console.log(e);
    }
});

exports.get = (word, callback) => {
    db.get('select * from stardict where word=?', [word], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(false, row);
        }
    })
};