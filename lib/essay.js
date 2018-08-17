const fs = require('fs');
const readline = require('readline');

function getContext(word, line){
    let index = line.indexOf(word);
    if (index < 0) {
        return word;
    }
    let from = index;
    let to   = index;
    while (from > 0) {
        if ('.?!'.indexOf(line.charAt(from)) >= 0) {
            from += 1;
            break;
        }
        from --;
    }
    while (to < line.length - 1) {
        if ('.?!'.indexOf(line.charAt(to)) >= 0) {
            break;
        }
        to ++;
    }
    return line.slice(from, to + 1).trim();
}

function format(word){
    let cf = word.charCodeAt(0);
    if (cf >= 97 && cf <= 122) {
        return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
    }
} 

exports.extract = (src, callback) => {
    var map = {};
    var rl = readline.createInterface({
        input: fs.createReadStream(src)
    })
    rl.on('line', (d) => {
        d.split(/[^a-zA-Z0-9]/).forEach((x) => {
            if (x.length === 1 || x.match(/^\d+$/)) {
                return;
            }
            x = format(x);
            if (x && x.length > 0) {
                if (x in map) {
                    map[x].times += 1;
                } else {
                    map[x] = {
                        times: 1,
                        context: getContext(x, d)
                    };
                }
            }
        })
    })
    rl.on('close', () => {
        callback(false, map)
    })
};