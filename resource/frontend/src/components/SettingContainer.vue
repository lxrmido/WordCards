<template>
    <div class="setting-container" id="setting-container">
        <div class="hd">设置</div>
        <div class="btn close" @click="close">&#xe603;</div>
        <div class="setting-area">
            <div class="row">
                <div class="group">
                    快捷键
                </div>
            </div>
            <div class="row" v-for="(key, name) in settings.hotkeys" v-bind:key="name">
                <div class="hot-key-type">
                    {{ getKeyLang(name) }}
                </div>
                <div class="hot-key-item" v-for="(k, kIndex) in key" v-bind:key="k">
                    <div class="key">
                        {{ getNameByKeyCode(k) }}
                    </div>
                    <div class="remove" @click="removeKey(name, kIndex)">
                        &#xe82a;
                    </div>
                </div>
                <div class="add-key-btn" @click="addKey(name)">&#xe651;</div>
            </div>
            <div class="row">
                <div class="group">
                    时间设置
                </div>
            </div>
            <div class="row">
                <div class="setting-item-key">
                     释义缓出(秒)
                </div>
                <div class="setting-adjust">
                    <div class="btn dec" @click="updateTime('delay', 'dec')">&#xe65f;</div>
                    <div class="indicator">{{ settings.times.delay }}</div>
                    <div class="btn inc" @click="updateTime('delay', 'inc')">&#xe615;</div>
                </div>
            </div>
        </div>
        <div class="mask" v-show="isWaitingInput">
            <div class="tips">请按下按键</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'setting-container',
        data () {
            return {
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
                isWaitingInput: false
            }
        },
        methods: {
            updateSettings (settings) {
                Object.keys(settings.hotkeys).forEach((x) => {
                    this.updateKeysArray(x, settings.hotkeys[x]);
                })
                Object.keys(settings.times).forEach((x) => {
                    this.settings.times[x] = settings.times[x];
                })
            },
            updateKeysArray (k, arr) {
                this.settings.hotkeys[k].length = 0;
                arr.forEach((x) => {
                    this.settings.hotkeys[k].push(x);
                });
            },
            updateTime (key, val) {
                switch (val) {
                    case 'inc':
                        this.settings.times[key] ++;
                        break;
                    case 'dec':
                        if (this.settings.times[key] >= 0) {
                            this.settings.times[key] --;
                        }
                        break;
                    default:
                        this.settings.times[key] = val;
                        break;
                }
            },
            getKeyLang (key) {
                var map = {
                    prev: '前进',
                    next: '后退',
                    ignore: '忽略',
                    star: '收藏'
                }
                return map[key];
            },
            getNameByKeyCode (keyCode) {
                var keyCodesMap = {
                    8: 'backspace',
                    9: 'tab',
                    13: 'enter',
                    16: 'shift',
                    17: 'ctrl',
                    18: 'alt',
                    19: 'pause_break',
                    20: 'caps_lock',
                    27: 'escape',
                    33: 'page_up',
                    34: 'page_down',
                    35: 'end',
                    36: 'home',
                    37: 'left_arrow',
                    38: 'up_arrow',
                    39: 'right_arrow',
                    40: 'down_arrow',
                    45: 'insert',
                    46: 'delete',
                    48: '0',
                    49: '1',
                    50: '2',
                    51: '3',
                    52: '4',
                    53: '5',
                    54: '6',
                    55: '7',
                    56: '8',
                    57: '9',
                    65: 'a',
                    66: 'b',
                    67: 'c',
                    68: 'd',
                    69: 'e',
                    70: 'f',
                    71: 'g',
                    72: 'h',
                    73: 'i',
                    74: 'j',
                    75: 'k',
                    76: 'l',
                    77: 'm',
                    78: 'n',
                    79: 'o',
                    80: 'p',
                    81: 'q',
                    82: 'r',
                    83: 's',
                    84: 't',
                    85: 'u',
                    86: 'v',
                    87: 'w',
                    88: 'x',
                    89: 'y',
                    90: 'z',
                    91: 'left_win',
                    92: 'right_win',
                    93: 'select',
                    96: 'num_0',
                    97: 'num_1',
                    98: 'num_2',
                    99: 'num_3',
                    100: 'num_4',
                    101: 'num_5',
                    102: 'num_6',
                    103: 'num_7',
                    104: 'num_8',
                    105: 'num_9',
                    106: 'multiply',
                    107: 'add',
                    109: 'subtract',
                    110: 'decimal_point',
                    111: 'divide',
                    112: 'f1',
                    113: 'f2',
                    114: 'f3',
                    115: 'f4',
                    116: 'f5',
                    117: 'f6',
                    118: 'f7',
                    119: 'f8',
                    120: 'f9',
                    121: 'f10',
                    122: 'f11',
                    123: 'f12',
                    144: 'num_lock',
                    145: 'scroll_lock',
                    186: 'semi_colon',
                    187: 'equal_sign',
                    188: 'comma',
                    189: 'dash',
                    190: 'period',
                    191: 'forward_slash',
                    192: 'grave_accent',
                    219: 'open_bracket',
                    220: 'back_slash',
                    221: 'close_braket',
                    222: 'single_quote'
                };
                if (keyCode in keyCodesMap) {
                    return keyCodesMap[keyCode];
                } else {
                    return '#' + keyCode;
                }
            },
            removeKey (key, index) {
                this.settings.hotkeys[key].splice(index, 1);
            },
            addKey (key) {
                var wf = (ev) => {
                    if (!this.settings.hotkeys[key].includes(ev.keyCode)) {
                        this.settings.hotkeys[key].push(ev.keyCode);
                    }
                    window.removeEventListener('keydown', wf);
                    this.isWaitingInput = false;
                    ev.preventDefault();
                    ev.stopPropagation();
                    return false;
                };
                this.isWaitingInput = true;
                window.addEventListener('keydown', wf);
            },
            getSettings () {
                return JSON.parse(JSON.stringify(this.settings));
            },
            close () {
                this.$emit('close', this.getSettings());
            }
        }
    }
</script>

<style lang="less" scoped>
    .setting-container{
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #131719;
        z-index: 200;
        overflow: hidden;
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
    .btn.close{
        right: 4px;
        top: 4px;
    }
    .hd{
        position: absolute;
        top: 4px;
        left: 40px;
        right: 40px;
        overflow: hidden;
        height: 32px;
        line-height: 32px;
        color: #25b8c1;
        text-align: center;
        background-color: #030709;
        border-radius: 0 0 8px 8px;
    }
    .setting-area{
        position: absolute;
        top: 40px;
        left: 40px;
        right: 40px;
        bottom: 0;
        overflow-x: hidden;
        overflow-y: auto;
    }
    .row{
        position: relative;
        width: 100%;
        margin: 0;
        height: auto;
        min-height: 32px;
        line-height: 32px;
        clear: both;
        overflow: hidden;
        font-size: 16px;
        color: #fff;
    }
    .group{
        width: 100px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        margin: 4px auto;
        clear: both;
        overflow:hidden;
        color: #fff;
    }
    .hot-key-type{
        width: auto;
        float: left;
        height: 32px;
        line-height: 32px;
    }
    .hot-key-item{
        float: left;
        width: auto;
        min-width: 24px;
        overflow:hidden;
        height: 24px;
        margin: 4px 0 4px 8px;
        background-color: #434749; 
        
        border-radius: 12px;
    }
    .hot-key-item > .key{
        float: left;
        width: auto;
        min-width: 1px;
        overflow:hidden;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        padding: 0 4px 0 8px;
        color: #e3e7e9;
    }
    .hot-key-item > .remove{
        float: left;
        width: 24px;
        overflow:hidden;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        cursor: pointer;
        user-select: none;
        color: #e3e7e9;
        font-family: opfont;
        text-align: center;
        background-color: #ae323b;
        border-radius: 12px;
    }
    .add-key-btn{
        float: left;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        font-family: opfont;
        text-align: center;
        font-size: 12px;
        cursor: pointer;
        user-select: none;
        margin: 4px 0 4px 8px;
        background-color: #434749; 
        color: #e3e7e9;
        border-radius: 12px;
    }
    .setting-item-key{
        width: 100px;
        float: left;
        height: 32px;
        line-height: 32px;
    }
    .setting-adjust{
        height: 32px;
        width: auto;
        min-width: 1px;
        overflow: hidden;
        float: left;
        position: relative;
        > .btn{
            float: left;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            font-family: opfont;
            text-align: center;
            font-size: 12px;
            cursor: pointer;
            user-select: none;
            margin: 4px 0;
            background-color: #434749; 
            color: #e3e7e9;
            border-radius: 12px;
            position: relative;
            &.dec{
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }
            &.inc{
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
            }
        }
        > .indicator{
            float: left;
            width: 48px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            font-family: opfont;
            text-align: center;
            font-size: 12px;
            cursor: pointer;
            user-select: none;
            margin: 4px 0;
            background-color: #434749; 
            color: #e3e7e9;
            position: relative;
        }
    }
    .mask{
        position: absolute;
        left: 8px;
        right: 8px;
        top: 8px;
        bottom: 8px;
        background-color: rgba(0, 0, 0, .9);
        z-index: 1000;
        > .tips {
            width: 100px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            margin-left: -50px;
            margin-top: -16px;
        }
    }
</style>