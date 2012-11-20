var getList = require('./comics_list.js').getList;
var allImgUrl = require('./comics_down').allImgUrl;
var fs = require('fs');

var conf = {
	prefix: 'cache/',
	db: 'db/'
};

getList('http://www.dm5.com/manhua-zuiqianghuizhangheishen/', function (err, pair) {
	if (err) {
		console.log(err);
		return;
	}
	fs.mkdirSync(conf.prefix + piar.title);
	var i = 0;
	allImgUrl('http://www.dm5.com/' + pair.href, function (err, imgUrl) {
		if (err) {
			console.log(pair.title + ' Error: ' + err);
			return;
		}
	});
});
