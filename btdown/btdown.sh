#!/bin/bash
# Date : 	2010/08/05 23:04:58
# Name : 	btdown.sh

for url in $(python ./torrents.py) 
do
	wget $url
done

