var sqlite3 = require('sqlite3');
var events = require('events');
var util = require('util');

var MetadataStorage = function (db) {
	events.EventEmitter.call(this);
	this.db = new sqlite3.Database(db);
	this.bookCache = {};
	this.stmtPool = {};
}
util.inherits(MetadataStorage, events.EventEmitter);

MetadataStorage.prototype.init = function () {
	var sql = 'SELECT * FROM book_info;';
	var self = this;
	self.db.each(sql, function (err, row) {
		if (err)
			self.emit('error', err);
		else
			self.bookCache[row.url] = row.id;
	}, function (err) {
		if (err)
			self.emit('error', err);
		else
			self.emit('init');
	});
}

MetadataStorage.prototype.bookId = function (bookPath) {
	var id = this.bookCache[bookPath];
	if (typeof id != 'number') {
		//this.emit('error', 'Book cache fail: ' + bookPath);
		return;
	}
	return id;
}

MetadataStorage.prototype.checkBook = function (bookPath) {
	var id = this.bookId(bookPath);
	if (typeof id == 'number') {
		this.emit('check_book', id);
		return;
	}
	// book info is not exists.
	var newId = 0;
	for (var k in this.bookCache) {
		var id = this.bookCache[k];
		if (id > newId)
			newId = id;
	}
	newId++; // Generate new book id(it's max value).
	var self = this;
	var stmt = self.db.prepare('INSERT INTO book_info VALUES (?, ?);');
	stmt.run(bookPath, newId, function (err) {
		if (err) {
			self.emit('error', err);
			return;
		}
		self.bookCache[bookPath] = newId;
		self.emit('check_book', newId);
	});
}

MetadataStorage.prototype.queryChapters = function (bookPath) {
	var id = this.bookId(bookPath);
	if (id === undefined)
		return;
	var sql = 'SELECT * FROM chapter_info WHERE book=\'' + id + '\'';
	var self = this;
	self.db.all(sql, function (err, rows) {
		if (err)
			self.emit('error', err);
		else
			self.emit('chapters', rows, bookPath);
	});
	return self;
}

MetadataStorage.prototype.insertChapter = function (bookPath, chapter,
	chapterPath) {
	var id = this.bookId(bookPath);
	if (id === undefined)
		return;
	var self = this;
	if (self.stmtPool.insertChapter === undefined)
		self.stmtPool.insertChapter = self.db.prepare(
			'INSERT OR REPLACE INTO chapter_info VALUES(?, ?, ?);');
	self.stmtPool.insertChapter.run(chapterPath, id, chapter,
		function (err) {
		if (err)
			self.emit('error', err);
	});
	return self;
}

MetadataStorage.prototype.insertPage = function (bookPath, chapter, page,
	imgUrl, state) {
	var id = this.bookId(bookPath);
	if (id === undefined)
		return;
	var self = this;
	if (self.stmtPool.insertPage === undefined)
		self.stmtPool.insertPage = self.db.prepare(
		'INSERT INTO page_info VALUES(?, ?, ?, ?, ?);');
	self.stmtPool.insertPage.run(imgUrl, id, chapter, page, state,
		function (err) {
		if (err)
			self.emit('error', err);
	});
	return self;
}

exports.MetadataStorage = MetadataStorage;

function demo () {
	var ms = new exports.MetadataStorage('data/dm5.db');
	ms.on('init', function () {
		debugger;
		ms.insertChapter('aaa', '<<1>>', 'm111');
		ms.queryChapters('aaa');
	}).on('error', function (err) {
		console.log(err);
	}).on('chapters', function (rows, bookPath) {
		var chapters ={};
		rows.forEach(function (i) {
			chapters[i.chapter] = i.url;
		});
		console.log(chapters);
	}).init();
}

