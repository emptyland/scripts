var http = require('http');
var html = require('htmlparser');
var select = require('soupselect').select;
var allImgUrl = require('./comics_down').allImgUrl;


function getList(url, callback) {
	http.get(url, function (res) {
		var content = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			content += chunk.toString();
		});
		res.on('end', function () {
			if (typeof res.headers.location == 'string')
				getList(res.headers.location, callback);
			else
				parseHtml(content, callback);
		});
	}).on('error', function(err) {
		callback(err);
	});
}

function parseHtml(content, callback) {
	var handler = new html.DefaultHandler(function (err, dom) {
		if (err)
			callback(err)
	});
	var parser = new html.Parser(handler);
	parser.parseComplete(content);
	select(handler.dom, 'a.tg').forEach(function (child) {
		callback(null, {
			title: child.attribs.title,
			href: child.attribs.href.substr(0, child.attribs.href.length - 1)
		});
	});
}

// getList('http://www.dm5.com/manhua-zuiqianghuizhangheishen/', function (err, pair) {
// 	console.log(pair);
// });

exports.getList = getList;

getList('http://www.dm5.com/manhua-zuiqianghuizhangheishen/', function (err, pair) {
	if (err) {
		console.log(err);
		return;
	}
	//console.log('--------' + pair.title + '--------');
	allImgUrl('http://www.dm5.com/' + pair.href, function (err, imgUrl) {
		if (err) {
			console.log(pair.title + ' Error: ' + err);
			return;
		}
		console.log('    ' + imgUrl);
	});
});