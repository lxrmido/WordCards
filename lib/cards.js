const config = require('../config');
const fs = require('fs');

if (!fs.existsSync(config.words_json_file)) {
    console.log('Words json file "' + config.words_json_file + '" not found.');
}

const cards = JSON.parse(fs.readFileSync(config.words_json_file));

console.log('Cards loaded:' + cards.length);

exports.get = (index) => {
    return cards[index];
};

exports.length = cards.length;