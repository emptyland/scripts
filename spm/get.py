#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import urllib2
import sys
from pyquery import PyQuery as pq
from decimal import Decimal

URL_DAMAIN='http://ggzyjy.sc.gov.cn'
QUERY_URL='http://ggzyjy.sc.gov.cn/Info/GetInfoListNew?keywords=&times=6&timesStart=2018-01-01&timesEnd=2019-04-23&province=&area=&businessType=land&informationType=DealLandInfo&industryType=&page=%d&parm=1556028658069'

def curlQuery(pageNo):
	resp = urllib2.urlopen(QUERY_URL % (pageNo));
	return resp.read().decode('utf-8')

def curlContent(link):
	resp = urllib2.urlopen(URL_DAMAIN + link);
	return resp.read().decode('utf-8')	

def parseUrls(raw):
	res = json.loads(raw)
	if res['status'] != 1:
		print 'fail: ' + raw
		sys.exit(1)
	pageCount = res['pageCount']
	return (pageCount, json.loads(res['data']))

def buildColumn(f, link):
	row = []
	doc = pq(URL_DAMAIN + link)
	its = doc("div.Introduce").items()
	for it in its:
		row.append((it.text().split(u'：'))[0].strip())
	s = ''
	for col in row:
		s = s + col + ','
	f.write(s + u'\n')	

def buildRow(f, link):
	row = []
	doc = pq(curlContent(link))
	its = doc("div.Introduce").items()
	for it in its:
		row.append((it.text().split(u'：'))[1].strip())
	if len(row) != 9:
		print 'exception!', row
	s = ''
	for col in row:
		if len(col) == 0:
			col = '   '
		if col.find(' 万元 人民币') > 0:
			col = col.replace(' 万元 人民币', '')
		elif col.find(' 元 人民币') > 0:
			col = col.replace(' 元 人民币', '')
			#print col
			col = str(Decimal(col) / Decimal(10000))

		s = s + col.replace(',', '') + ','
	f.write(s + u'\n')

if __name__ == '__main__':
	reload(sys)
	sys.setdefaultencoding('utf8')
	raw = curlQuery(1)
	# (pageCount, data) = parseUrls(raw)
	# print 'pageCount:', pageCount
	# allLinks = []
	# f = open('1-urls.txt', 'w')
	# for i in xrange(1, pageCount + 1):
	# 	print 'curl page %d' % (i)
	# 	(pageCount, data) = parseUrls(curlQuery(i))
	# 	for item in data:
	# 		f.write(item['Link'] + u'\n')
	# 		allLinks.append(item['Link'])
	# f.close()

	f = open('1-urls.txt', 'r')
	allLinks = f.readlines()
	f.close()

	partLen = len(allLinks) / 4
	n = int(sys.argv[1])

	#print allLinks
	#print curlContent(allLinks[0])
	index = n * partLen
	f = open('p-%d.csv' % (n), 'w')
	if n == 0:
		buildColumn(f, allLinks[0])
	for link in allLinks[n * partLen:(n + 1) * partLen]:
		link = link.replace('\n', '')
		print '[%d] %s' % (index, link)
		index = index + 1
		buildRow(f, link)
	f.close()


