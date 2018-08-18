function api (a, b, c, d){
    var url, arg, func_ok, func_er;
    func_er = defaultErrorHandler;
    if (arguments.length == 4) {
        url = a;
        arg = b;
        func_ok = c;
        func_er = d;
    } else if (arguments.length == 3) {
        url = a;
        if (typeof b == "function") {
            func_ok = b;
            func_er = c;
        } else {
            arg = b;
            func_ok = c;
        }
    } else if (arguments.length == 2) {
        url = a;
        if (typeof b == "function") {
            func_ok = b;
        } else {
            arg = b;
        }
    } else {
        url = a;
    }
    arg = arg || {};

    var xhr = new XMLHttpRequest();
    xhr.handleerror = function (d) {
        if (!d) {
            func_er && func_er(1001, 'Unexpected error(1).');
        } else if (typeof d == "string"){
            func_er && func_er(1002, 'Server returns unexpected.');
        } else if (d.errcode !== undefined){
            func_er && func_er(d.errcode, d.errmessage);
        } else {
            func_er && func_er(1003, 'Unexpected error(2).');
        }
    }
    xhr.onreadystatechange = function() {
        var d;
        if (this.readyState == 4) {
            if (this.status == 200) {
                d = this.responseText;
                try {
                    d = JSON.parse(d);
                } catch (e) {
                    return this.handleerror(d);
                }
                if (('errcode' in d) && (d.errcode === 0)) {
                    func_ok && func_ok(d.data)
                } else {
                    return this.handleerror(d);
                }
            }else{
                return this.handleerror();
            }
        }
    }
    xhr.open("POST", 'api/' + url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(serialize(arg));
};

function defaultErrorHandler(errcode, errmessage){
    alert(errmessage);
}

function serialize(o){
    var a = [], i;
    for(i in o){
        a.push(i + '=' + encodeURIComponent(o[i]));
    }
    return a.join('&');
};