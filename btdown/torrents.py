#!/usr/bin/python
# -*- coding: utf-8 -*-

from xml.dom import minidom
import urllib, re, sys, sqlite3
"""import re
import sys
import sqlite3"""

regular_keywords = [u'.*妄想学生会.*', u'.*圣痕炼金士.*']

def fetch_rss_xml(url):
	conn = urllib.urlopen(url)
	xmldoc = minidom.parse(conn)
	conn.close()
	return xmldoc

def get_target_torrent_urls(xmldoc, keys):
	urls = []
	items = xmldoc.getElementsByTagName('item')
	for item in items:
		title = item.getElementsByTagName('title')[0].firstChild.data
		if match_keys(title, keys):
			attr = item.getElementsByTagName('enclosure')[0].attributes['url']
			urls.append(attr.value)
	return urls

def match_keys(repo, keys):
	return [key for key in keys if re.match(key, repo)]

def init_database(conn_string):
	conn = sqlite3.connect(conn_string)
	sql = conn.cursor()
	try:
		sql.execute('''CREATE TABLE history (id INT PRIMARY KEY NOT NULL, url TEXT NOT
				NULL)''')
	except sqlite3.OperationalError:
		return conn
	return conn

def main():
	conn = init_database('database')
	xmldoc = fetch_rss_xml('http://bt.ktxp.com/rss-team-1.xml')

	sql = conn.cursor()
	urls = get_target_torrent_urls( xmldoc, regular_keywords )
	for url in urls:
		try:
			sql.execute('INSERT INTO history VALUES(?,?)', (hash(url), url) )
			print url
		except sqlite3.IntegrityError:
			url = ''
	conn.commit()
	
	conn.close()
	return 0

if __name__ == '__main__':
	exit(main())
