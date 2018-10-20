const Koa = require('koa')
const Static = require('koa-static');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');
const path = require('path');
const config = require('./config')
const progress = require('./lib/progress');
const cards = require('./lib/cards');

const app = new Koa();

let apiRouter = new Router();
let rootRouter = new Router();

let latestWordProgress = null;

apiRouter.post('/word', async (ctx) => {
    let r = await getCurrentCard();
    latestWordProgress = r.progress;
    ctx.body = makeJsonReturn(r);
});
apiRouter.post('/settings', async (ctx) => {
    ctx.body = makeJsonReturn(getSettings());
});
apiRouter.post('/prev', async (ctx) => {
    progress.vars.index -= 1;
    let r = await getCurrentCard(true);
    latestWordProgress = r.progress;
    ctx.body = makeJsonReturn(r);
    progress.save();
});
apiRouter.post('/next', async (ctx) => {
    if (latestWordProgress) {
        latestWordProgress.times ++;
        progress.putWord(latestWordProgress);
    }
    progress.vars.index += 1;
    let r = await getCurrentCard();
    latestWordProgress = r.progress;
    ctx.body = makeJsonReturn(r);
    progress.save();
});
apiRouter.post('/star', async (ctx) => {
    if (latestWordProgress) {
        latestWordProgress.star = 1;
        progress.putWord(latestWordProgress);
    }
    ctx.body = makeJsonReturn();
});
apiRouter.post('/unstar', async (ctx) => {
    if (latestWordProgress) {
        latestWordProgress.star = 0;
        progress.putWord(latestWordProgress);
    }
    ctx.body = makeJsonReturn();
});
apiRouter.post('/ignore', async (ctx) => {
    if (latestWordProgress) {
        latestWordProgress.ignore = 1;
        progress.putWord(latestWordProgress);
    }
    ctx.body = makeJsonReturn();
});
apiRouter.post('/setkey', async (ctx) => {
    let key = ctx.request.body.key;
    let val = ctx.request.body.val.split(',');
    progress.vars['hk_' + key] = [];
    val.forEach((x) => {
        let kv = parseInt(x);
        if (kv > 0){
            progress.vars['hk_' + key].push(kv);
        }
    });
    progress.save();
    ctx.body = makeJsonReturn();
});
apiRouter.post('/setcfg', async (ctx) => {
    let key  = ctx.request.body.key;
    let type = ctx.request.body.type;
    let val  = ctx.request.body.val;
    switch (type) {
        case 'int':
            val = parseInt(val);
            break;
        default:
            break;
    }
    progress.vars['cfg_' + key] = val;
    console.log(progress);
    progress.save();
    ctx.body = makeJsonReturn();
});

app.use(BodyParser());
app.use(Static(path.join(__dirname, './resource/static')));

rootRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

app.use(rootRouter.routes()).use(rootRouter.allowedMethods());

app.listen(config.web_server_port, () => {

});

function makeJsonReturn(d){
    d = d || {};
    return JSON.stringify({
        errcode: 0,
        errmessage: 'ok',
        data: d
    });
}

function getCurrentCard(reverse){
    return new Promise((resolve, reject) => {
        fetchCurrentCard((card) => {
            resolve(card);
        }, 1, !!reverse);
    });
}

function getSettings(){
    return {
        hotkeys: {
            prev: progress.vars.hk_prev,
            next: progress.vars.hk_next,
            star: progress.vars.hk_star,
            ignore: progress.vars.hk_ignore
        },
        times: {
            delay: progress.vars.cfg_delay
        }
    }
}

function fetchCurrentCard(callback, tryTimes, reverse){
    var card;
    if (!tryTimes) {
        tryTimes = 1;
    } else if (tryTimes >= cards.length) {
        return callback(false);
    }
    if (progress.vars.index < 0) {
        progress.vars.index = cards.length - 1;
        return fetchCurrentCard(callback, tryTimes + 1, reverse);
    } else if (progress.vars.index < cards.length) {
        card = cards.get(progress.vars.index);
    } else {
        progress.vars.index = 0;
        return fetchCurrentCard(callback, tryTimes + 1, reverse);
    }
    progress.getWord(card.word, (err, wordProgress) => {
        if (err) {
            return callback(false);
        }
        if (wordProgress.ignore === 1) {
            if (reverse) {
                progress.vars.index --;
            } else{
                progress.vars.index ++;
            }
            return fetchCurrentCard(callback, tryTimes + 1, reverse);
        } else {
            return callback({
                index: progress.vars.index,
                total: cards.length,
                card: card,
                progress: wordProgress
            })
        }
    });
}