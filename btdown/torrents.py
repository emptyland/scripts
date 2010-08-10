#!/usr/bin/python
# -*- coding: utf-8 -*-

from xml.dom import minidom
import hashlib, urllib, re, sys, sqlite3, os, time

# runtime log object.
rt_log = None

class btdown_log:
	fd = None
	def __init__(self, record_path):
		self.fd = open(record_path, 'a')
	def log(self, msg, level = 0):
		line = u'[%d] [%s] %s\n' % (level, time.ctime(), msg)
		self.fd.write(line)
		self.fd.flush()


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
	global rt_log
	urls = []
	items = xmldoc.getElementsByTagName('item')
	for item in items:
		title = item.getElementsByTagName('title')[0].firstChild.data
		if match_keys(title, keys):
			attr = item.getElementsByTagName('enclosure')[0].attributes['url']
			#rt_log.log('%s matched, URL : %s' % (title, attr.value))
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
		sql.execute('CREATE TABLE history (url TEXT PRIMARY KEY NOT NULL, hash TEXT NOT NULL)')
	except sqlite3.OperationalError:
		return conn
	return conn

def init_config(filename):
	"""
	Read rss urls and reguler keywords from xml configure file.
	"""
	xmldoc = minidom.parse(filename)
	cmd = xmldoc.getElementsByTagName('cmd')[0].firstChild.data
	record_path = xmldoc.getElementsByTagName('log')[0].firstChild.data
	items = xmldoc.getElementsByTagName('rss')[0].getElementsByTagName('entry')
	rss_urls = [ item.firstChild.data for item in items ]
	items = xmldoc.getElementsByTagName('keys')[0].getElementsByTagName('entry')
	regular_keywords = [ item.firstChild.data for item in items ]
	return (cmd, record_path, rss_urls, regular_keywords)

def fetch_torrent(filename, url):
	"""
	Fetch a torrent file from url.
	"""
	conn = urllib.urlopen(url)
	fd = open(filename, 'w')
	fd.write(conn.read())
	fd.close()

def url_never_downloaded(url, conn):
	sql = conn.cursor()
	sql.execute('SELECT COUNT(*) FROM history WHERE url=\'%s\'' % (url))
	for row in sql:
		return not row[0]

def torrent_never_downloaded(filename, conn):
	digest = hashlib.sha1(filename).hexdigest()
	sql = conn.cursor()
	sql.execute('SELECT COUNT(*) FROM history WHERE hash=\'%s\'' % (digest))
	for row in sql:
		return not row[0]

def log_torrent(filename, url, conn):
	digest = hashlib.sha1(filename).hexdigest()
	sql = conn.cursor()
	sql.execute('INSERT INTO history VALUES (\'%s\', \'%s\')' % (url, digest))
	conn.commit()

def bt_download_target(cmd, url, conn):
	"""
	BT download a target torrent.
	"""
	global rt_log
	generator = hashlib.md5(os.urandom(16))
	if url_never_downloaded( url, conn ):
		filename = 'tmp.%s.torrent' % (generator.hexdigest())
		fetch_torrent(filename, url)
		if torrent_never_downloaded(filename, conn) and os.system(cmd % (filename)) == 0:
			print url, '->', filename
			rt_log.log( 'Fetch %s .' % (url))
			log_torrent(filename, url, conn)
			os.remove(filename)

def bt_download_targets(cmd, rss_urls, regular_keywords, conn):
	"""
	Main loop : foreach all of rss urls and fetch target torrent file(s).
	"""
	global rt_log
	for rss_url in rss_urls:
		xmldoc = fetch_rss_xml(rss_url)
		rt_log.log('Parse RSS : %s.' % (rss_url))
		urls = get_target_torrent_urls( xmldoc, regular_keywords )
		for url in urls:
			bt_download_target(cmd, url, conn)

def main():
	global rt_log
	(cmd, record_path, rss_urls, regular_keywords) = init_config('btdown.conf')
	rt_log = btdown_log(record_path)
	rt_log.log('BT downloading begin.')
	conn = init_database('database')
	rt_log.log('Database initialized.')
	bt_download_targets(cmd, rss_urls, regular_keywords, conn)
	rt_log.log('BT downloading end.')
	conn.close()
	return 0



#
# Real entry :
#
if __name__ == '__main__':
	exit(main())
