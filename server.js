const Koa = require('koa')
const Static = require('koa-static');
const Router = require('koa-router')
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
apiRouter.post('/prev', async (ctx) => {
    progress.vars.index -= 1;
    let r = await getCurrentCard();
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

function getCurrentCard(){
    return new Promise((resolve, reject) => {
        fetchCurrentCard((card) => {
            resolve(card);
        });
    });
}

function fetchCurrentCard(callback, tryTimes){
    var card;
    if (!tryTimes) {
        tryTimes = 1;
    } else if (tryTimes >= cards.length) {
        return callback(false);
    }
    if (progress.vars.index < cards.length - 1) {
        card = cards.get(progress.vars.index);
    } else {
        progress.vars.index = 0;
        return fetchCurrentCard(callback, tryTimes + 1);
    }
    progress.getWord(card.word, (err, wordProgress) => {
        if (err) {
            return callback(false);
        }
        if (wordProgress.ignore === 1) {
            progress.vars.index ++;
            return fetchCurrentCard(callback, tryTimes + 1);
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