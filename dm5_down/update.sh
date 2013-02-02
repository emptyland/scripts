#!/bin/bash

function allBook() {
sqlite3 data/dm5.db << EOF
	SELECT url FROM book_info;
EOF
}

for i in $(allBook); do
	node app.js "http://www.dm5.com${i}"
done
