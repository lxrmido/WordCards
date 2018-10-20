
<template>
    <div class="card-container">
        <div class="btn full" 
            v-show="!fullscreen" 
            @click="enterFullScreen">&#xe61d;</div>
        <div class="btn full" 
            v-show="fullscreen"
            @click="cancelFullScreen">&#xe61e;</div>
        <div class="btn star" 
            :class="{actived: stared}"
            @click="toggleStar">&#xe938;</div>
        <div class="btn remove"
            @click="ignoreWord">&#xe82a;</div>
        <div class="btn next"
            @click="nextWord">&#xe615;</div>
        <div class="btn prev"
            @click="prevWord">&#xe65f;</div>
        <div class="btn setting"
            @click="showSetting">&#xe666;</div>
        <div class="btn refresh"
            @click="getWord">&#xe61f;</div>
        <canvas class="board" ref="cvsBoard"></canvas>
        <div class="index-indicator">
            {{ index + 1 }} / {{ total }}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'card-container',
        data () {
            return {
                currentData: null,
                availWidth: 0,
                availHeight: 0,
                time: 0,
                stared: false,
                index: 0,
                total: 0,
                inited: false,
                settings: {
                    hotkeys: {
                        prev: [],
                        next: [],
                        ignore: [],
                        star: []
                    },
                    times: {
                        delay: 0
                    }
                },
                fullscreen: false,
                isFocus: false,
                showExplainTimeout: null
            }
        },
        methods: {
            updateSettings (settings) {
                if (!this.inited) {
                    this.init();
                }
                Object.keys(settings.hotkeys).forEach((x) => {
                    this.updateKeysArray(x, settings.hotkeys[x]);
                });
                Object.keys(settings.times).forEach((x) => {
                    this.settings.times[x] = settings.times[x];
                });
                this.isFocus = true;
            },
            updateKeysArray (k, arr) {
                this.settings.hotkeys[k].length = 0;
                arr.forEach((x) => {
                    this.settings.hotkeys[k].push(x);
                });
            },
            init () {
                this.clock();
                this.paintThread();
                this.getWord();
                window.addEventListener('keydown', (ev) => {
                    var isSet = false
                    if (this.isFocus) {
                        if (this.settings.hotkeys.next.includes(ev.keyCode)) {
                            isSet = true;
                            this.nextWord();
                        } else if (this.settings.hotkeys.prev.includes(ev.keyCode)) {
                            isSet = true;
                            this.prevWord();
                        } else if (this.settings.hotkeys.ignore.includes(ev.keyCode)) {
                            isSet = true;
                            this.ignoreWord();
                        } else if (this.settings.hotkeys.star.includes(ev.keyCode)) {
                            isSet = true;
                            this.toggleStar();
                        }
                    }
                    if (isSet) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                });
                this.inited = true;
            },
            clock () {
                var w = window.innerWidth - 72;
                var h = window.innerHeight - 72;
                if ((w !== this.availWidth) || (h !== this.availHeight)) {
                    this.resize(w, h);
                }
                this.time += 50;
                setTimeout(this.clock, 50);
            },
            resize (w, h) {
                let cvsBoard = this.$refs.cvsBoard;
                if (window.devicePixelRatio && window.devicePixelRatio > 1) {
                    cvsBoard.width = parseInt(w * window.devicePixelRatio);
                    cvsBoard.height = parseInt(h * window.devicePixelRatio);
                } else {
                    cvsBoard.width = w;
                    cvsBoard.height = h;
                }
                cvsBoard.style.width = w + 'px';
                cvsBoard.style.height = h + 'px';
                this.availWidth = w;
                this.availHeight = h;
                if (this.currentData) {
                    this.renderCard();
                }
            },
            enterFullScreen () {
                var element = document.getElementById('app');
                if (element.requestFullScreen) {
                    element.requestFullScreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullScreen) {
                    element.msRequestFullScreen();
                }
                this.fullscreen = true;
            },
            cancelFullScreen () {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.mskitCancelFullScreen) {
                    document.msCancelFullScreen();
                }
                this.fullscreen = false;
            },
            toggleStar () {
                if (this.stared) {
                    this.unstarWord();
                } else {
                    this.starWord();
                }
            },
            showSetting () {
                this.isFocus = false;
                this.$emit('setting');
            },
            getWord () {
                this.$api('word', (data) => {
                    if (data) {
                        this.renderCard(data);
                    }
                }, (errcode, errmessage) => {
                    alert(errmessage)
                });
            },
            nextWord () {
                this.$api('next', (data) => {
                    if (data) {
                        this.renderCard(data);
                    }
                });
            },
            prevWord () {
                this.$api('prev', (data) => {
                    if (data) {
                        this.renderCard(data);
                    }
                });
            },
            starWord () {
                this.$api('star', () => {
                    this.getWord();
                });
            },
            unstarWord () {
                this.$api('unstar', () => {
                    this.getWord();
                });
            },
            ignoreWord () {
                this.$api('ignore', () => {
                    this.getWord();
                });
            },
            renderCard (data) {
                if (data) {
                    this.time = 0;
                    this.currentData = data;
                } else {
                    data = this.currentData;
                }
            },
            raf (f) {
                if ('requestAnimationFrame' in window) {
                    return window.requestAnimationFrame(f);
                }
                if ('webkitRequestAnimationFrame' in window) {
                    return window.webkitRequestAnimationFrame(f);
                }
                if ('mozRequestAnimationFrame' in window) {
                    return window.mozRequestAnimationFrame(f);
                }
                if ('msRequestAnimationFrame' in window) {
                    return window.msRequestAnimationFrame(f);
                }
                return setTimeout(f, 40);
            },
            paintThread () {
                if (this.currentData && this.isFocus) {
                    this.paintCard(this.currentData);
                }
                this.raf(this.paintThread);
            },
            paintCard (data) {
                let cvsBoard = this.$refs.cvsBoard;
                let ctxBoard = cvsBoard.getContext('2d');
                let drawTranslation = true;
                let drawContext = true;
                if (this.time < this.settings.times.delay * 1000) {
                    drawTranslation = false;
                    drawContext = false;
                }
                this.index = data.index;
                this.total = data.total;
                this.stared = data.progress.star === 1;
                var w = cvsBoard.width;
                var h = cvsBoard.height;
                var y = parseInt(h / 16);
                var word = data.card.word;
                var translation = data.card.translation;
                var phonetic = (data.card.phonetic && data.card.phonetic.length > 0) ? ('/ ' + data.card.phonetic + ' /') : '-';
                var context = data.card.context;
                ctxBoard.clearRect(0, 0, w, h);
                ctxBoard.textAlign = 'start';
                ctxBoard.textBaseline = 'middle';
                ctxBoard.fillStyle = '#25b8c1';
                ctxBoard.font = ctxBoard.getPropertySingleLineFont(word, parseInt(h / 8));
                ctxBoard.fillText(word, 0, h / 16);

                y += parseInt(h / 8);
                ctxBoard.fillStyle = '#61839f';
                ctxBoard.font = ctxBoard.getPropertySingleLineFont(phonetic, parseInt(h / 12));
                ctxBoard.fillText(phonetic, 0, y);

                y += parseInt(h / 8);
                

                if (drawTranslation) {
                    ctxBoard.fillStyle = '#ffffff';
                    ctxBoard.font = ctxBoard.getPropertySingleLineFont(translation, parseInt(h / 12), parseInt(h / 16));
                    let transLines = ctxBoard.getTextLines(translation, cvsBoard.width, true);
                        if (transLines/length <= 1) {
                        ctxBoard.fillText(translation, 0, y);
                        y += parseInt(h / 8);
                    } else {
                        y += ctxBoard.fillTextLines(transLines, 0, y);
                    }
                }

                if (drawContext) {
                    ctxBoard.fillStyle = '#61839f';
                    ctxBoard.font = ctxBoard.getPropertyMultiLineFont(context, cvsBoard.width, parseInt(cvsBoard.height * 5 / 8), parseInt(h / 12))
                    ctxBoard.fillTextLines(ctxBoard.getTextLines(data.card.context), 0, y);
                }

                if (this.settings.times.delay > 0) {
                    ctxBoard.fillRect(0, cvsBoard.height - 4, parseInt((1 - this.time / (this.settings.times.delay * 1000)) * cvsBoard.width), 4);
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .card-container{
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #131719;
        z-index: 100;
    }
    .btn{
        position: absolute;
        width: 32px;
        height: 32px;
        font-family: opfont;
        text-align: center;
        color: #535759;
        font-size: 16px;
        line-height: 32px;
        cursor: pointer;
        user-select: none;
    }
    .btn.book{
        left: 4px;
        top: 4px;
    }
    .btn.setting{
        left: 4px;
        top: 4px;
    }
    .btn.full{
        right: 4px;
        top: 4px;
    }
    .btn.star{
        right: 4px;
        bottom: 4px;
    }
    .btn.star.actived{
        color: #ee3739;
    }
    .btn.remove{
        left: 4px;
        bottom: 4px;
    }
    .btn.close{
        right: 4px;
        top: 4px;
    }
    .btn.next{
        top: 50%;
        margin-top: -48px;
        right: 4px;
        height: 96px;
        line-height: 96px;
    }
    .btn.prev{
        top: 50%;
        margin-top: -48px;
        left: 4px;
        height: 96px;
        line-height: 96px;
    }
    .btn.refresh{
        top: 4px;
        left: 50%;
        margin-left: -16px;
    }
    .board{
        position: absolute;
        top: 36px;
        left: 36px;
    }
    .index-indicator{
        width: 100px;
        height: 32px;
        line-height: 32px;
        position: absolute;
        bottom: 4px;
        left: 50%;
        margin-left: -50px;
        color: #737779;
        font-size: 14px;
        text-align: center;
    }
</style>