var fetchList = require('./comics_list').fetchList;
var fetchImgUrl = require('./comics_down').fetchImgUrl;
var fetchImg = require('./img_fetcher').fetchImg;
var fs = require('fs');
var URL = require('url');

var conf = {
	prefix: 'cache/',
	db: 'db/'
};


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
	}).on('end', function () {
		fetchImg(dir, url, imgList).on('progress', function (code, i) {
			if (code != 0)
				console.log('[' + i + '] fail: ' + code);
		}).on('end', function () {
			console.log(list[index].title + ' ... done');
			download(prefix, list, index + 1);
		}).fetchAll();
	}).fetch();
}

function fetch(url, begin) {
	var urlMeta = URL.parse(url);
	var prefix = urlMeta.protocol + '//' + urlMeta.hostname;
	fetchList(url).on('end', function (list) {
		download(prefix, list, begin);
	}).on('error', function (err) {
		console.log(err);
	}).fetch();
}

fetch('http://tel.dm5.com/manhua-zuiqianghuizhangheishen/', 176);

