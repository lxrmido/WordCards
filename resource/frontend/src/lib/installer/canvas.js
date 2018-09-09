export default function (injection, Vue) {
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

    CanvasRenderingContext2D.prototype.getTextLines = function (text, maxWidth, space) {
        maxWidth = maxWidth || this.canvas.width;
        var lines = [];
        var i, j;
        var result;
        while (text.length) {
            for(i = text.length; this.measureText(text.substr(0,i)).width > maxWidth; i --);
            result = text.substr(0,i);
            if (i !== text.length) {
                if (!space) {
                    for(j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);
                }
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
        return i * lineHeight;
    };

}