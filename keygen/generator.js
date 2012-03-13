var kTable = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890~!@#$%^&*()_+`-=[]{}\\|;\':",./<>?';
var kTableLen = kTable.length;
var kNumLetter = 52;
var kKeyLen = 16;
var kSeed = 1234567;

function hasString(url) {
    var n = 1315423911;
    //alert("init n << 5:" + ((n << 5) & 0x7fffffff));
    for (var i = 0; i < url.length; ++i) {
        n ^= (((n << 5) & 0x7fffffff) + url.charCodeAt(i) + (n >> 2));
    }
    return n & 0xffffffff;
}

function firstString(code) {
    var low = (code + kSeed) & 0xffff;
    var hig = ((code & 0xffff0000) >> 16) | kSeed;
    var i = ((low * hig) & 0x7fffffff) % kNumLetter;
    return kTable.charAt(i);
}

function char2Esc(ch) {
    switch (ch) {
    case "<":
        return "&#60;";
    
    case ">":
        return "&#62;";
        
    case "&":
        return "&#38;";
        
    case "\"":
        return "&#34;";
    }
    return ch;
}

function generateKey(url) {
    var initial_code = hasString(url);
    //alert("init:" + initial_code);
    var passwd = firstString(initial_code);
    var n = initial_code;
    var c = 0;
    if (url.length == 0) {
        return "[::EMPTY::]";
    }
    for (i = 0; i < kKeyLen - 1; ++i) {
        n = (n * url.charCodeAt(c++ % url.length) + kSeed) ^ initial_code;
        passwd += char2Esc(kTable.charAt(Math.abs(n) % kTableLen));
        //alert("n: " + n + ", i: " + i + ", char: " + passwd);
    }
    return passwd;
}

function generate() {
    var input_url_ctl = document.getElementById("input_url");
    var passwd = generateKey(input_url_ctl.value);
    var output_passwd_ctl = document.getElementById("output_passwd");
    output_passwd_ctl.innerHTML = "<p>" + passwd + "</p>";
    input_url_ctl.focus();
}
