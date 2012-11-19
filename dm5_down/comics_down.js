var http = require('http');
var html = require('htmlparser');
var query = require('querystring');
var select = require('soupselect').select;
var cook = require('cookie');
var URL = require('url');
var zlib = require('zlib');
var fs = require('fs');


// Example: 'http://www.dm5.com/m114933'
function allImgUrl(url, callback) {
	getImgUrl(url + '/', function (err, imgUrl, info) {
		if (err) {
			callback(err);
			return;
		}
		var prefix = url;
		var i = 0;
		for (i = 1; i < info.maxcount; ++i) {
			getImgUrl(prefix + '-p' + (i + 1) + '/', function (err, imgUrl, info) {
				callback(err, imgUrl);
			});
		}
	});
}

// Get image url from html
function getImgUrl(url, callback) {
	http.get(url, function (res) {
		var content = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			content += chunk.toString();
		});
		res.on('end', function () {
			cookie = cook.parse('' + res.headers['set-cookie']);
			if (typeof res.headers.location == 'string')
				getImgUrl(res.headers.location, callback);
			else
				parseHtml(url, content, cookie, callback);
		});
	}).on('error', function(err) {
		callback(err);
	});
}

function parseHtml(url, content, cookie, callback) {
	var handler = new html.DefaultHandler(function (err, dom) {
		if (err)
			callback(err)
	});
	var parser = new html.Parser(handler);
	parser.parseComplete(content);
	// FIXME: any time working?
	var i = 0;
	var scriptNode = [];
	select(handler.dom, 'script').forEach(function (child) {
		if (typeof child.attribs == 'undefined' ||
			typeof child.attribs.src == 'undefined')
			//console.log(child);
			scriptNode[i++] = child;
	});
	getKey(url, scriptNode, cookie, callback);
}

function getKey(url, scriptNode, cookie, callback) {
	var script = scriptNode[0].children[0].data;
	var keygen = scriptNode[1].children[0].data;
	
	eval(script);
	if (keygen.indexOf('eval(function(p,a,c,k,e,d)') >= 0) {
		//console.log(keygen);
		var $ = function (a) {
			return {
				val: function(key) {
					parseImgUrl(url, {
						cid: DM5_CID,
						page: DM5_FLOAT_INDEX,
						key: key,
						uid: 0,
						mid: DM5_MID,
						maxcount: DM5_IMAGE_COUNT,
						language: 1 }, cookie, callback);
				}
			};
		};
		eval(keygen);
	} else {
		parseImgUrl(url, {
			cid: DM5_CID,
			page: DM5_FLOAT_INDEX,
			key: '',
			uid: 0,
			mid: DM5_MID,
			maxcount: DM5_IMAGE_COUNT,
			language: 1 }, cookie, callback);
	}
}

function fakeHistory(url, options, cookie, callback) {
	var queryUrl = url + 'history.ashx?';
	queryUrl += query.stringify({
		cid: options.cid,
		mid: options.mid,
		page: options.page,
		uid: options.uid,
		language: options.language
	});

	httpGet(queryUrl, cookie, function (res) {
		res.setEncoding('utf8');
		res.on('end', function () {
			parseImgUrl(url, options, cookie, callback);
		});
	}).on('error', function(err) {
		callback(err)
	});
}

function fakeUserInfo(url, options, cookie, callback) {
	var queryUrl = url + 'userinfo.ashx?d=' + new Date();
	httpGet(queryUrl, cookie, function (res) {
		res.setEncoding('utf8');
		res.on('end', function () {
			parseImgUrl(url, options, cookie, callback);
		});
	}).on('error', function(err) {
		callback(err)
	});
}

function parseImgUrl(url, options, cookie, callback) {
	var queryUrl = url + 'chapterimagefun.ashx?';
	queryUrl += query.stringify({
		cid: options.cid,
		page: options.page,
		language: options.language,
		key: options.key
	});
	// Request options:
	httpGet(queryUrl, cookie, function (res) {
		var encoding = res.headers['content-encoding'];
		var totalBuf = new Buffer(0);
		res.on('data', function (chunk) {
			totalBuf = Buffer.concat([totalBuf, chunk]);
		}).on('end', function () {
			switch (encoding) {
			case 'gzip':
				zlib.gunzip(totalBuf, function (err, buf) {
					if (err) {
						callback(err);
					} else {
						eval(buf.toString('utf8'));
						callback(null, d[0], options);
					}
				});
				break
			default:
				eval(totalBuf.toString('utf8'));
				callback(null, d[0], options);
				break;
			}
		});
	}).on('error', function(err) {
		callback(err)
		content = '';
	});
}

function httpGet(url, cookie, handled) {
	var urlOpt = URL.parse(url);
	var getOpt = {
		host: urlOpt.host,
		port: 80,
		path: urlOpt.href,
		headers: {
			'Connection': 'keep-alive',
			'Cookie': 'ASP.NET_SessionId='
				+ cookie['ASP.NET_SessionId']
				+ '; DM5_MACHINEKEY='
				+ cookie['DM5_MACHINEKEY']
				+ '; norefresh=false',
			'Cache-Control': 'max-age=0',
			'Accept': '*/*',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept-Encoding': 'gzip,deflate',
			'Referer': url,
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
		}
	};
	//console.log(getOpt);
	return http.get(getOpt, handled);
}

// The fake stub function(s):
function reseturl(arg0, arg1) {}
var window = { location: { href: '' } };
// End

// 99: 'http://www.dm5.com/m87284'
// 171: 'http://www.dm5.com/m115296'
// 'http://www.dm5.com/m87762'
// 100: 'http://www.dm5.com/m87516'
// allImgUrl('http://www.dm5.com/m87284', function (err, imgUrl) {
// 	if (err)
// 		console.log('Error:' + err);
// 	else
// 		console.log(imgUrl);
// });

exports.allImgUrl = allImgUrl;
