#!/usr/bin/python
# -*- coding: utf-8 -*-

from xml.dom import minidom
import urllib, re, sys, sqlite3

def match_keys(repo, keys):
	return [key for key in keys if re.match(key, repo)]

def fetch_rss_xml(url):
	"""
	Fetch rss xml file from internet.
	"""
	conn = urllib.urlopen(url)
	xmldoc = minidom.parse(conn)
	conn.close()
	return xmldoc

def get_target_torrent_urls(xmldoc, keys):
	"""
	Match target rss's torrent url
	"""
	urls = []
	items = xmldoc.getElementsByTagName('item')
	for item in items:
		title = item.getElementsByTagName('title')[0].firstChild.data
		if match_keys(title, keys):
			attr = item.getElementsByTagName('enclosure')[0].attributes['url']
			urls.append(attr.value)
	return urls

def init_database(conn_string):
	"""
	Initizlizate database file by sqlite3
	If database is not exist, create a new one
	"""
	conn = sqlite3.connect(conn_string)
	sql = conn.cursor()
	try:
		sql.execute('''CREATE TABLE history (id INT PRIMARY KEY NOT NULL,
				url TEXT NOT NULL)''')
	except sqlite3.OperationalError:
		return conn
	return conn

def init_config(filename):
	"""
	Read rss urls and reguler keywords from xml configure file.
	"""
	xmldoc = minidom.parse(filename)
	items = xmldoc.getElementsByTagName('rss')[0].getElementsByTagName('entry')
	rss_urls = [ item.firstChild.data for item in items ]
	items = xmldoc.getElementsByTagName('keys')[0].getElementsByTagName('entry')
	regular_keywords = [ item.firstChild.data for item in items ]
	return (rss_urls, regular_keywords)

def print_target_urls(rss_urls, regular_keywords, conn):
	"""
	Main loop : foreach all of rss urls and print target torrent urls.
	"""
	sql = conn.cursor()
	for rss_url in rss_urls:
		xmldoc = fetch_rss_xml(rss_url)
		urls = get_target_torrent_urls( xmldoc, regular_keywords )
		for url in urls:
			try:
				sql.execute('INSERT INTO history VALUES(?,?)', (hash(url), url) )
				print url
			except sqlite3.IntegrityError:
				url = ''
		conn.commit()

def main():
	(rss_urls, regular_keywords) = init_config('./btdown.conf')
	conn = init_database('database')
	print_target_urls(rss_urls, regular_keywords, conn)
	conn.close()
	return 0

if __name__ == '__main__':
	exit(main())
