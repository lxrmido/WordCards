(function(window){
    var btnFullScreen = document.getElementById('btn-full');
    var btnExitFullScreen = document.getElementById('btn-exit-full');
    var btnPrev = document.getElementById('btn-prev');
    var btnNext = document.getElementById('btn-next');
    var btnRemove = document.getElementById('btn-remove');
    var btnStar = document.getElementById('btn-star');
    var btnRefresh = document.getElementById('btn-refresh');

    var indexIndicator = document.getElementById('index-indicator');

    var cvsBoard = document.getElementById('cvs-board');
    var ctxBoard = cvsBoard.getContext('2d');

    var currentData = null;
    var availWidth = 0;
    var availHeight = 0;
    var time = 0;

    btnFullScreen.onclick = function () {
        var element = document.getElementById('card-container');
        if (element.requestFullScreen) {
            element.requestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullScreen) {
            element.msRequestFullScreen();
        }
        btnExitFullScreen.style.display = 'block';
        btnFullScreen.style.display = 'none';
    }
    btnExitFullScreen.onclick = function () {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.mskitCancelFullScreen) {
            document.msCancelFullScreen();
        }
        btnExitFullScreen.style.display = 'none';
        btnFullScreen.style.display = 'block';
    }
    btnNext.onclick = function () {
        nextWord();
    }
    btnPrev.onclick = function () {
        prevWord();
    }
    btnRefresh.onclick = function () {
        getWord();
    }
    btnStar.onclick = function () {
        if (currentData.progress.star === 1) {
            unstarWord();
        } else {
            starWord();
        }
    }
    btnRemove.onclick = function () {
        ignoreWord();
    }

    window.onload = setTimeout(function(){
        init();
    }, 100);

    function init(){
        clock();
        getWord();
    }

    function clock(){
        var w = window.innerWidth - 72;
        var h = window.innerHeight - 72;
        if ((w !== availWidth) || (h !== availHeight)) {
            resize(w, h);
        }
        setTimeout(clock, 100);
    }

    function resize(w, h){
        if (window.devicePixelRatio && window.devicePixelRatio > 1) {
            cvsBoard.width = parseInt(w * window.devicePixelRatio);
            cvsBoard.height = parseInt(h * window.devicePixelRatio);
        } else {
            cvsBoard.width = w;
            cvsBoard.height = h;
        }
        cvsBoard.style.width = w + 'px';
        cvsBoard.style.height = h + 'px';
        availWidth = w;
        availHeight = h;
        if (currentData) {
            renderCard();
        }
    }

    function getWord(){
        api('word', function (data) {
            if (data) {
                renderCard(data);
            }
        }, function (errcode, errmessage) {
            alert(errmessage)
        });
    }

    function nextWord(){
        api('next', function (data) {
            if (data) {
                renderCard(data);
            }
        });
    }

    function prevWord(){
        api('prev', function (data) {
            if (data) {
                renderCard(data);
            }
        });
    }

    function starWord(){
        api('star', function (data) {
            getWord();
        });
    }

    function unstarWord(){
        api('unstar', function (data) {
            getWord();
        });
    }

    function ignoreWord(){
        api('ignore', function (data) {
            getWord();
        });
    }

    function renderCard(data){
        if (data) {
            currentData = data;
        } else {
            data = currentData;
        }

        indexIndicator.innerHTML = data.index + ' / ' + data.total;

        if (data.progress.star === 1) {
            btnStar.className = 'btn star actived';
        } else {
            btnStar.className = 'btn star';
        }

        var w = cvsBoard.width;
        var h = cvsBoard.height;
        var y = parseInt(h / 16);
        var word = data.card.word;
        var phonetic = (data.card.phonetic && data.card.phonetic.length > 0) ? ('/ ' + data.card.phonetic + ' /') : '-';
        var translation = data.card.translation;
        var context = data.card.context;

        ctxBoard.clearRect(0, 0, w, h);
        ctxBoard.textAlign = 'start';
        ctxBoard.textBaseline = 'middle';
        ctxBoard.fillStyle = '#25b8c1';
        ctxBoard.font = ctxBoard.getPropertySingleLineFont(data.card.word, parseInt(h / 8));
        ctxBoard.fillText(data.card.word, 0, h / 16);

        y += parseInt(h / 8);
        ctxBoard.fillStyle = '#61839f';
        ctxBoard.font = ctxBoard.getPropertySingleLineFont(phonetic, parseInt(h / 12));
        ctxBoard.fillText(phonetic, 0, y);

        y += parseInt(h / 8);
        ctxBoard.fillStyle = '#ffffff';
        ctxBoard.font = ctxBoard.getPropertySingleLineFont(data.card.translation, parseInt(h / 12));
        ctxBoard.fillText(data.card.translation, 0, y);

        y += parseInt(h / 8);
        ctxBoard.fillStyle = '#61839f';
        ctxBoard.font = ctxBoard.getPropertyMultiLineFont(context, cvsBoard.width, parseInt(cvsBoard.height * 5 / 8), parseInt(h / 12))
        ctxBoard.fillTextLines(ctxBoard.getTextLines(data.card.context), 0, y);
    }


    CanvasRenderingContext2D.prototype.getPropertySingleLineFont = function (text, max, min, font) {
        font = font || 'Arial'
        max = max || 40;
        min = min || 12;
        var lastFont = this.font;
        var fontSize = max;
        this.font = fontSize + 'px ' + font;
        var metrics = this.measureText(text);
        while (metrics.width > this.canvas.width) {
            fontSize -= 1;
            if (fontSize < min) {
                this.font = lastFont;
                return min + 'px ' + font;
            }
            this.font = fontSize + 'px ' + font;
            metrics = this.measureText(text);
        }
        this.font = lastFont;
        return fontSize + 'px ' + font;
    }

    CanvasRenderingContext2D.prototype.getPropertyMultiLineFont = function (text, width, height, max, min, font) {
        font = font || 'Arial'
        max = max || 40;
        min = min || 12;
        var lastFont = this.font;
        var fontSize = max;
        var lineHeight = parseInt(fontSize * 1.5);
        this.font = fontSize + 'px ' + font;
        var lines = this.getTextLines(text, width);
        while (lines.length * lineHeight > height) {
            fontSize --;
            if (fontSize < min) {
                this.font = lastFont;
                return min + 'px ' + font;
            }
            lineHeight = parseInt(fontSize * 1.5);
            lines = this.getTextLines(text, width);
        }
        this.font = lastFont;
        return fontSize + 'px ' + font;
    }

    CanvasRenderingContext2D.prototype.getTextLines = function (text, maxWidth) {
        maxWidth = maxWidth || this.canvas.width;
        var lines = [];
        var i, j;
        while (text.length) {
            for(i = text.length; this.measureText(text.substr(0,i)).width > maxWidth; i --);
            result = text.substr(0,i);
            if (i !== text.length) {
                for(j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);
            }
            lines.push(result.substr(0, j || result.length));
            text  = text.substr( lines[ lines.length-1 ].length, text.length );
        }
        return lines;
    };

    CanvasRenderingContext2D.prototype.fillTextLines = function (lines, x, y, lineHeight) {
        var i;
        lineHeight = lineHeight || parseInt(parseInt(this.font) * 1.5)
        for (i = 0; i < lines.length; i ++) {
            this.fillText(lines[i], x, y + i * lineHeight);
        }
    };

})(window);