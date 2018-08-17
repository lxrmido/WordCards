const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const fs = require('fs');

var db = new sqlite3.Database(config.progress_db_file, sqlite3.OPEN_READWRITE, (e) => {
    if (e) {
        console.log(e);
    }
});

if (fs.existsSync(config.progress_json_file)) {
    map = JSON.parse(fs.readFileSync(config.progress_json_file));
}

var map = fs.