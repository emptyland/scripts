#!/usr/bin/python
# -*- coding: utf-8 -*-

from xml.dom import minidom
import hashlib, urllib, re, sys, sqlite3, os, time

# runtime log object.
rt_log = None

class btdown_log:
	def __init__(self, record_path):
		self.fd = open(record_path, 'a')
		
	def log(self, msg):
		line = '[%s] %s\n' % (time.ctime(), msg)
		self.fd.write(line)
		self.fd.flush()


class torrent_history:
	table_sql = 'CREATE TABLE history (url TEXT PRIMARY KEY NOT NULL, hash TEXT NOT NULL)'
	url_sql = 'SELECT COUNT(*) FROM history WHERE url=\'%s\''
	torrent_sql = 'SELECT COUNT(*) FROM history WHERE hash=\'%s\''
	record_sql = 'INSERT INTO history VALUES (\'%s\', \'%s\')'
        
	def __init__(self, db_path):
		"""
		Initizlizate database file by sqlite3
		If database is not exist, create a new one.
		"""
		self.conn = sqlite3.connect(db_path)
		sql = self.conn.cursor()
		try:
			sql.execute(self.table_sql)
		except sqlite3.OperationalError:
			pass
					
	def url_never_downloaded(self, url):
		"""
		Check did URL download first.
		"""
		sql = self.conn.cursor()
		sql.execute(self.url_sql % (url))
		for row in sql:
			return not row[0]

	def torrent_never_downloaded(self, filename):
		"""
		We need check did torrent file download.
		"""                
		digest = hashlib.sha1(filename).hexdigest()
		sql = self.conn.cursor()
		sql.execute(self.torrent_sql % (digest))
		for row in sql:
			return not row[0]

	def record(self, filename, url):
		"""
		Record URL string and torrent SHA1 digest.
		"""
		digest = hashlib.sha1(filename).hexdigest()
		sql = self.conn.cursor()
		sql.execute(self.record_sql % (url, digest))
		self.conn.commit()


class btdown_conf:
	def __init__(self, conf_path):
		"""
		Read rss urls and reguler keywords from xml configure file.
		"""
		xmldoc = minidom.parse(conf_path)
		self.cmd = xmldoc.getElementsByTagName('cmd')[0].firstChild.data
		self.log_path = xmldoc.getElementsByTagName('log')[0].firstChild.data
		self.pid_path = xmldoc.getElementsByTagName('pid')[0].firstChild.data
		self.db_path = xmldoc.getElementsByTagName('db')[0].firstChild.data
		# Get RSS URLs
		items = xmldoc.getElementsByTagName('rss')[0].getElementsByTagName('entry')
		self.rss_urls = [ item.firstChild.data for item in items ]
		# Get regular keywords
		items = xmldoc.getElementsByTagName('keys')[0].getElementsByTagName('entry')
		self.regular_keywords = [ item.firstChild.data for item in items ]


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
			rt_log.log('\"%s\" matched, URL : %s' % (title, attr.value))
			urls.append(attr.value)
	return urls

def fetch_torrent(filename, url):
	"""
	Fetch a torrent file from url.
	"""
	conn = urllib.urlopen(url)
	fd = open(filename, 'w')
	fd.write(conn.read())
	fd.close()

def bt_download_target(cmd, url, history):
	"""
	BT download a target torrent.
	"""
	global rt_log
	generator = hashlib.md5(os.urandom(16))
	rt_log.log('BT downloading begin.')
	if history.url_never_downloaded( url ):
		filename = 'tmp.%s.torrent' % (generator.hexdigest())
		fetch_torrent(filename, url)
		if history.torrent_never_downloaded(filename) and os.system(cmd % (filename)) == 0:
			print url, '->', filename
			rt_log.log( 'Fetch %s' % (url))
			history.record(filename, url)
			os.remove(filename)
	rt_log.log('BT downloading end.')

def bt_download_targets(conf, history):
	"""
	Main loop : foreach all of rss urls and fetch target torrent file(s).
	"""
	global rt_log
	for rss_url in conf.rss_urls:
		xmldoc = fetch_rss_xml(rss_url)
		rt_log.log('Parse RSS : %s' % (rss_url))
		urls = get_target_torrent_urls( xmldoc, conf.regular_keywords )
		for url in urls:
			bt_download_target(conf.cmd, url, history)

def check_running(pid_path):
	try:
		fd = open(pid_path, 'r')
		print 'Instance %s is runing.' % (fd.read())
		exit(127)
	except IOError:
		fd = open(pid_path, 'w')
		fd.write(str(os.getpid()))

def main():
	global rt_log
	conf = btdown_conf('btdown.conf')
	check_running(conf.pid_path)
	rt_log = btdown_log(conf.log_path)
	history = torrent_history(conf.db_path)
	rt_log.log('Database initialized.')
	bt_download_targets(conf, history)
	os.remove(conf.pid_path)
	return 0


#
# Real entry :
#
if __name__ == '__main__':
	# Initialize encoding.
	reload(sys)
	sys.setdefaultencoding('utf-8')
	del sys.setdefaultencoding
	# "main" routine.
	exit(main())
