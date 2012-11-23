var child_process = require('child_process');
var events = require('events');
var util = require('util');
var fetchImgUrl = require('./comics_down.js').fetchImgUrl;


// Class define:
function ImgFetcher(dir, url, list) {
	events.EventEmitter.call(this);
	this.dir = dir;
	this.url = url;
	this.list = list;
	this.complete = 0;
}
util.inherits(ImgFetcher, events.EventEmitter);
// End


exports.fetchImg = function (dir, url, list) {
	return new ImgFetcher(dir, url, list);
}

ImgFetcher.prototype.fetchAll = function () {
	for (var i = 0; i < this.list.length; i++) {
		if (typeof this.list[i] == 'string')
			this.fetch(this.list[i], i);
	}
}

ImgFetcher.prototype.fetch = function (imgUrl, index) {
	var self = this;
	var cap = imgUrl.match(/\.(png|jpg|bmp|jpge|gif)\?/i);
	if (cap === null)
		console.error(imgUrl);
	var cmd = 'wget \'' + imgUrl + '\' --header=\"Referer: '
		+ self.url + '\" -q -O \"' + self.dir + index + '.' + cap[1] + '\"';
	child_process.exec(cmd, function () {}).on('exit', function (code) {
		self.emit('progress', code, index, imgUrl);
		self.complete++;
		if (self.complete == self.list.length)
			self.emit('end');
	});
}

function demo(url) {
	var list = [];
	fetchImgUrl(url).on('data', function (imgUrl, info) {
		list[info.page - 1] = imgUrl;
	}).on('error', function (err) {
		console.log(err);
	}).on('end', function () {
		exports.fetchImg('cache/', url, list)
		.on('progress', function (code, i, imgUrl) {
			if (code != 0)
				console.log('[' + i + '] fail:' + code);	
		}).on('end', function () {
			console.log('All over!');
		}).fetchAll();
	}).fetch();
}

//demo('http://www.dm5.com/m115296');
