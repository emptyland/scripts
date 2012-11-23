#!/bin/bash

sqlite3 dm5.db << EOF
CREATE TABLE IF NOT EXISTS page_info (url TEXT PRIMARY KEY, book INT, chapter TEXT, page INT, state TEXT);
CREATE INDEX IF NOT EXISTS page_info_index ON page_info (book, chapter);

CREATE TABLE IF NOT EXISTS chapter_info (url TEXT PRIMARY KEY, book INT, chapter TEXT);
CREATE INDEX IF NOT EXISTS chapter_info_index ON chapter_info (book);

CREATE TABLE IF NOT EXISTS book_info (url TEXT PRIMARY KEY, id INT NOT NULL);
EOF

if [[ ${1} == "test" ]]; then
sqlite3 dm5.db << EOF
	BEGIN TRANSACTION;
	DELETE FROM book_info;
	INSERT INTO book_info VALUES ('aaa', 0);
	INSERT INTO book_info VALUES ('bbb', 1);
	INSERT INTO book_info VALUES ('ccc', 2);
	INSERT INTO book_info VALUES ('ddd', 3);
	INSERT INTO book_info VALUES ('eee', 4);

	DELETE FROM chapter_info;
	INSERT INTO chapter_info VALUES ('m001', 0, '[1]');
	INSERT INTO chapter_info VALUES ('m002', 0, '[2]');
	INSERT INTO chapter_info VALUES ('m003', 1, '[1]');
	INSERT INTO chapter_info VALUES ('m004', 1, '[2]');

	DELETE FROM page_info;
	INSERT INTO page_info VALUES ('img:0', 0, '[1]', 0, NULL);
	INSERT INTO page_info VALUES ('img:1', 0, '[1]', 1, NULL);
	INSERT INTO page_info VALUES ('img:2', 0, '[1]', 2, NULL);
	INSERT INTO page_info VALUES ('img:3', 0, '[1]', 3, NULL);
	INSERT INTO page_info VALUES ('img:4', 0, '[2]', 0, NULL);
	INSERT INTO page_info VALUES ('img:5', 0, '[2]', 1, NULL);
	INSERT INTO page_info VALUES ('img:6', 0, '[2]', 2, NULL);
	INSERT INTO page_info VALUES ('img:7', 0, '[2]', 3, NULL);
	COMMIT TRANSACTION;
EOF
fi

# SELECT * FROM chapter_info WHERE book IN (SELECT id FROM book_info WHERE url='bbb');
# /^http:\/\/.*\/(\w+)\/?$/
