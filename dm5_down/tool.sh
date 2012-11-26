#!/bin/bash

sqlite3 data/dm5.db << EOF
	SELECT url FROM book_info;
EOF
