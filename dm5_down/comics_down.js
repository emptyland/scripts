var http = require('http');
var html = require('htmlparser');
var query = require('querystring');
var select = require('soupselect').select;
var cook = require('cookie');
var URL = require('url');
var zlib = require('zlib');
var events = require('events');
var util = require('util');
var child_process = require('child_process');

// Class define:
function ImgUrlFetcher(url) {
	events.EventEmitter.call(this);
	this.url = url;
	this.complete = 0;
}
util.inherits(ImgUrlFetcher, events.EventEmitter);
// End


exports.fetchImgUrl = function (url) {
	return new ImgUrlFetcher(url);
}

ImgUrlFetcher.prototype.fetch = function () {
	var self = this;
	self.saveAllListeners();
	self.on('data', function(imgUrl, info) {
		self.restoreAllListeners();
		self.emit('data', imgUrl, info);
		var prefix = self.url;
		var i = 0;
		for (i = 1; i < info.maxcount; ++i)
			self.getImgUrl(prefix + '-p' + (i + 1) + '/');
	}).on('error', function(err) {
		self.restoreAllListeners();
		self.emit('error', err);
	}).on('end', function() {
		self.restoreAllListeners();
		self.emit('end');
	}).getImgUrl(self.url);
}


// Get image url from html
ImgUrlFetcher.prototype.getImgUrl = function(url) {
	var self = this;
	http.get(url, function (res) {
		var content = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			content += chunk.toString();
		});
		res.on('end', function () {
			self.cookie = cook.parse('' + res.headers['set-cookie']);
			if (typeof res.headers.location == 'string')
				self.getImgUrl(res.headers.location);
			else
				self.parseHtml(url, content);
		});
	}).on('error', function(err) {
		self.emit('error', err);
	});
}

ImgUrlFetcher.prototype.parseHtml = function (url, content) {
	var self = this;
	var handler = new html.DefaultHandler(function (err, dom) {
		if (err)
			self.emit('error', err)
	});
	var parser = new html.Parser(handler);
	parser.parseComplete(content);
	var scriptNode = [];
	if (typeof handler.dom == 'undefined')
		return;
	select(handler.dom, 'script').forEach(function (child) {
		if (typeof child.attribs == 'undefined' ||
			typeof child.attribs.src == 'undefined')
			scriptNode.push(child);
	});
	this.getKey(url, scriptNode);
}

ImgUrlFetcher.prototype.getKey = function (url, scriptNode) {
	var script = scriptNode[0].children[0].data;
	var keygen = scriptNode[1].children[0].data;
	
	var self = this;
	eval(script);
	if (keygen.indexOf('eval(function(p,a,c,k,e,d)') >= 0) {
		//console.log(keygen);
		var $ = function (a) {
			return {
				val: function(key) {
					self.parseImgUrl(url, {
						cid: DM5_CID,
						page: DM5_FLOAT_INDEX,
						key: key,
						uid: 0,
						mid: DM5_MID,
						maxcount: DM5_IMAGE_COUNT,
						language: 1 });
				}
			};
		};
		eval(keygen);
	} else {
		self.parseImgUrl(url, {
			cid: DM5_CID,
			page: DM5_FLOAT_INDEX,
			key: '',
			uid: 0,
			mid: DM5_MID,
			maxcount: DM5_IMAGE_COUNT,
			language: 1 });
	}
}

ImgUrlFetcher.prototype.fakeUserInfo = function (url, options) {
	var urlMeta = URL.parse(url);
	var queryUrl = urlMeta.protocol + '//' + urlMeta.hostname
		+ '/userinfo.ashx?d=' + new Date();
	var self = this;
	this.httpGet(queryUrl, function (res) {
		res.on('end', function () {
			self.parseImgUrl(url, options);
		}).on('error', function (err) {
			self.emit('error', err);
		});
	}).on('error', function (err) {
		self.emit('error', err);
	});
}

ImgUrlFetcher.prototype.fakeHistory = function (url, options) {
	var queryUrl = url + 'history.ashx?';
	queryUrl += query.stringify({
		cid: options.cid,
		mid: options.mid,
		page: options.page,
		uid: options.uid,
		language: options.language
	});
	console.error(queryUrl);
	var self = this;
	this.httpGet(queryUrl, function (res) {
		res.on('end', function () {
			self.parseImgUrl(url, options);
		}).on('error', function (err) {
			self.emit('error', err);
		});
	}).on('error', function (err) {
		self.emit('error', err);
	});
}

ImgUrlFetcher.prototype.parseImgUrl = function (url, options) {
	var queryUrl = url + 'chapterimagefun.ashx?';
	queryUrl += query.stringify({
		cid: options.cid,
		page: options.page,
		language: options.language,
		key: options.key
	});
	//console.log(queryUrl);

	var self = this;
	// Request options:
	self.httpGet(queryUrl, function (res) {
		var encoding = res.headers['content-encoding'];
		var totalBuf = new Buffer(0);
		res.on('data', function (chunk) {
			totalBuf = Buffer.concat([totalBuf, chunk]);
		}).on('end', function () {
			switch (encoding) {
			case 'gzip':
				zlib.gunzip(totalBuf, function (err, buf) {
					if (err) {
						self.emit('error', err);
					} else {
						eval(buf.toString('utf8'));
						self.emit('data', d[0], options);
					}
					if (++(self.complete) == options.maxcount)
						self.emit('end');
				});
				break
			default:
				eval(totalBuf.toString('utf8'));
				if (typeof d == 'undefined' || !util.isArray(d))
					self.emit('error', 'Can not get img url: ' + url);
				else
					self.emit('data', d[0], options);
				break;
			}
		});
	}).on('error', function(err) {
		self.emit('error', err)
	});
}

ImgUrlFetcher.prototype.saveAllListeners = function () {
	var _ = this.listeners('data');
	if (util.isArray(_))
		this.forData  = _[0];
	_ = this.listeners('error');
	if (util.isArray(_))
		this.forError = _[0];
	_ = this.listeners('end');
	if (util.isArray(_))
		this.forEnd = _[0];
	this.removeAllListeners();
}

ImgUrlFetcher.prototype.restoreAllListeners = function () {
	this.removeAllListeners();
	if (typeof this.forData == 'function') {
		this.on('data', this.forData);
		delete this.forData;
	}
	if (typeof this.forError == 'function') {
		this.on('error', this.forError);
		delete this.forError;
	}
	if (typeof this.forEnd == 'function') {
		this.on('end', this.forEnd);
		delete this.forEnd;
	}
}

ImgUrlFetcher.prototype.httpGet = function (url, handled) {
	var urlOpt = URL.parse(url);
	var getOpt = {
		host: urlOpt.host,
		port: 80,
		path: urlOpt.href,
		headers: {
			'Connection': 'keep-alive',
			'Cookie': 'ASP.NET_SessionId='
				+ this.cookie['ASP.NET_SessionId']
				+ '; DM5_MACHINEKEY='
				+ this.cookie['DM5_MACHINEKEY']
				+ '; norefresh=false',
			'Cache-Control': 'max-age=0',
			'Accept': '*/*',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept-Encoding': 'gzip,deflate',
			'Referer': this.url,
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
function demo(url) {
	exports.fetchImgUrl(url).on('data', function (imgUrl, info) {
		console.log(imgUrl);
	}).on('error', function (err) {
		console.log(err);
	}).fetch();
}

//demo('http://tel.dm5.com/m87284');
//demoDownload('http://www.dm5.com/m115296');
