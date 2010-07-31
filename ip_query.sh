#!/bin/bash
# Date : 	2009/11/05 17:04:28
# Name : 	ip_query.sh

declare -r HOST="www.ip138.com"

# Script entry :
if [[ $# != 1 ]]
then
	echo "[-] Invalid input"
	echo "Usage : ip_query.sh ip"
	echo "        ip_query.sh domain_name"
	exit 1
fi

echo "Send Request : $1 ..."
host $1

# Send a http request
req="http://$HOST/ips.asp?ip=$1&action=2"
ret=$(curl $req | sed -n -e '/<td align="center"><ul class="ul1">/p')
exec 3>&-

if [[ -z $ret ]]
then
	echo "[E] Bad request."
	exit 2
fi

# Convert GB2312 to UTF8
ret=$(echo $ret | iconv -f gb2312 -t utf-8)

# Edit the result
ret=$(echo $ret | sed -e 's/^<td align="center"><ul class="ul1">//' -e 's/<\/ul><\/td>//' )
ret=$(echo $ret | sed -e 's/^<li>//' -e 's/<\/li>//g')

# Display
echo $ret | awk -F"<li>" '{print "[+] " $1 "\n[+] " $2 "\n[+] " $3 }'
