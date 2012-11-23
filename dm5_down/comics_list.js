var http = require('http');
var html = require('htmlparser');
var select = require('soupselect').select;
var allImgUrl = require('./comics_down').allImgUrl;
var events = require('events');
var util = require('util');

// Class define:
function ListFetcher(url) {
	events.EventEmitter.call(this);
	this.url = url;
}
util.inherits(ListFetcher, events.EventEmitter);
// End

ListFetcher.prototype.fetch = function () {
	var self = this;
	http.get(this.url, function (res) {
		var content = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			content += chunk.toString();
		});
		res.on('end', function () {
			if (typeof res.headers.location == 'string') {
				self.url = res.headers.location;
				self.fetch();
			} else {
				self.parseHtml(content);
			}
		});
	}).on('error', function(err) {
		self.emit('error', err);
	});
}

ListFetcher.prototype.parseHtml = function (content) {
	var self = this;
	var handler = new html.DefaultHandler(function (err, dom) {
		if (err)
			self.emit('error', err);
	});
	var parser = new html.Parser(handler);
	parser.parseComplete(content);
	if (typeof handler.dom == 'undefined')
		return;
	var chapters = {}
	select(handler.dom, 'a.tg').forEach(function (child) {
		chapters[child.attribs.title] =
			child.attribs.href.substr(0, child.attribs.href.length - 1);
	});
	self.emit('end', chapters);
}

exports.fetchList = function (url) {
	return new ListFetcher(url);
}

function demo(url) {
	exports.fetchList(url).on('error', function (err) {
		console.log('error');
	}).on('end', function (list) {
		console.log(list);
	}).fetch();
}

//demo('http://www.dm5.com/manhua-zuiqianghuizhangheishen/');
