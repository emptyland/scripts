#!/bin/bash
# Date : 	2009/11/05 17:04:28
# Name : 	dump_http.sh

http_request()
{
	echo -e "$1 $2 HTTP/1.1\r\n"
	echo -e "Host:$3\r\n"
	echo -e "Accept:*/*\r\n"
	echo -e "User-Agent:Mozilla/4.0\r\n"
	echo -e "Connection:Keep-Alive\r\n\r\n"
}


exec 3<> /dev/tcp/www.g.cn/80
[[ $? != 0 ]] && exit 1

http_request "GET" "/" "www.g.cn" >&3
cat <&3
exec 3>&-
