var fetchList = require('./comics_list').fetchList;
var fetchImgUrl = require('./comics_down').fetchImgUrl;
var fetchImg = require('./img_fetcher').fetchImg;
var MetadataStorage = require('./db.js').MetadataStorage;
var fs = require('fs');
var url_util = require('url');
var http = require('http');


var conf = eval('(' + fs.readFileSync('conf.json', 'utf8') + ')');

/*
function download(prefix, list, index) {
	if (index == list.length)
		return;
	var dir = conf.prefix + list[index].title + '/';
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);

	var imgList = [];
	var url = prefix + list[index].href;
	fetchImgUrl(url).on('data', function (imgUrl, info) {
		imgList[info.page - 1] = imgUrl;
	}).on('error', function (err) {
		console.log(err);
		// Skip error page:
		download(prefix, list, index + 1);
	}).on('end', function () {
		fetchImg(dir, url, imgList).on('progress', function (code, i, imgUrl) {
			if (code != 0)
				console.log('[' + i + '] fail: ' + code);
		}).on('end', function () {
			console.log(list[index].title + ' ... done');
			download(prefix, list, index + 1);
		}).fetchAll();
	}).fetch();
}

function fetch(url, begin) {
	var urlMeta = url_util.parse(url);
	var prefix = urlMeta.protocol + '//' + urlMeta.hostname;
	fetchList(url).on('end', function (list) {
		download(prefix, list, begin);
	}).on('error', function (err) {
		console.log(err);
	}).fetch();
}

function sampleApp(argv) {
	var url = argv[2];
	if (typeof url != 'string')
		return 1;
	var begin = argv[3];
	if (typeof begin == 'string')
		begin = parseInt(begin);
	else
		begin = 0;
	fetch(url, begin);
}
*/

function CliApp(argv) {
	this.bookUrl = argv[2];
	this.chapters = {};
}

CliApp.prototype.run = function () {
	if (this.bookUrl === undefined) {
		this.usage();
		return;
	}
	var self = this;
	self.checkHost(function () {
		self.perpare(function () {
			self.updateChapters(function () {
				self.fetch(function () {
					console.log('all done');
				});
			});
		});
	});
}

CliApp.prototype.checkHost = function (done) {
	var urlMeta =  url_util.parse(this.bookUrl);
	var self = this;
	self.prefix = urlMeta.protocol + '//' + urlMeta.host;
	http.get(this.prefix, function (res) {
		res.on('end', function () {
			if (typeof res.headers.location == 'string')
				self.prefix = res.headers.location;
			done();
		});
	});
}

CliApp.prototype.perpare = function (done) {
	this.storage = new MetadataStorage(conf.db);
	this.bookPath = url_util.parse(this.bookUrl).path;
	var self = this;
	self.storage.on('init', function () {
		self.storage.checkBook(self.bookPath);
	}).on('error', function (err) {
		console.log('DB: ' + err);
	}).on('check_book', function (state) {
		self.storage.queryChapters(self.bookPath);
	}).on('chapters', function (rows, bookPath) {
		rows.forEach(function (i) {
			self.chapters[i.chapter] = i.url;
		});
		done();
	}).init();
}

CliApp.prototype.updateChapters = function (done) {
	var self = this;
	fetchList(self.prefix + self.bookPath)
	.on('end', function (newChapters) {
		self.todoList = {};
		for (var k in newChapters) {
			if (self.chapters[k] == undefined)
				self.todoList[k] = newChapters[k];
		}
		done();
	}).fetch();
}

CliApp.prototype.fetch = function (done) {
	this.todoSequence = [];
	for (var k in this.todoList)
		this.todoSequence.push(k);
	// Make the book dir;
	this.bookDir = conf.prefix
		+ this.bookUrl.match(/^http:\/\/.*\/([-\w]+)\/?$/)[1]
		+ '/';
	if (!fs.existsSync(this.bookDir))
		fs.mkdirSync(this.bookDir);
	this.downloadChapterByIndex(0);
}

CliApp.prototype.downloadChapterByIndex = function (index) {
	if (index == this.todoSequence.length)
		return;

	var chapter  = this.todoSequence[index];
	var chapterDir = this.bookDir + chapter + '/';
	var imgList = [];
	var self = this;
	var chapterUrl = self.prefix + self.todoList[chapter];
	debugger;
	fetchImgUrl(chapterUrl).on('data', function (imgUrl, info) {
		imgList[info.page - 1] = imgUrl;
	}).on('error', function (err) {
		console.log(err);
		// Skip error, go to next chapter:
		self.downloadChapterByIndex(index + 1);
	}).on('end', function () {
		if (!fs.existsSync(chapterDir))
			fs.mkdirSync(chapterDir);
		self.downloadImageList(chapterDir, chapter, chapterUrl, imgList,
			index);
	}).fetch();
}

CliApp.prototype.downloadImageList = function (chapterDir, chapter,
	chapterUrl, imgList, index) {
	var self = this;
	fetchImg(chapterDir, chapterUrl, imgList)
	.on('progress', function (code, i, imgUrl) {
		if (code != 0)
			console.log('Download [' + imgUrl + '] fail: ' + code);
		self.storage.insertPage(self.bookPath, chapter, i, imgUrl,
			code == 0 ? 'ok' : 'fail');
	}).on('end', function () {
		console.log(chapter + ' ... done');
		// Next chapter:
		self.downloadChapterByIndex(index + 1);
		// Update chapter table;
		self.storage.insertChapter(
			self.bookPath,
			chapter,
			self.todoList[chapter]);
	}).fetchAll();
}

CliApp.prototype.usage = function () {
	console.log('Bad argument');
}

var app = new CliApp(process.argv);
app.run();
