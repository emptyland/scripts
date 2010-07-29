#!/bin/bash
# Date : 	2009年 08月 26日 星期三 12:17:33 UTC
# Name : 	utime.sh

declare -r TIME_HOST=time.nist.gov
declare -r TIME_PORT=13
declare -r TIME_ZONE=+8


rtm=$(cat < /dev/tcp/${TIME_HOST}/${TIME_PORT} | sed 's/^$//g' | awk '{ print $3 }')
hour=$(echo $rtm | sed -e 's/:.*//' | sed -e 's/^0//')
let hour=($hour$TIME_ZONE)%24
if [[ $hour < "10" ]]
then
	hour=$(echo $hour | sed -e 's/^/0/')
fi

rtm=$(echo $rtm | sed "s/^[[:digit:]]\{2\}/${hour}/")
ltm=$(date | awk '{ print $5 }')
echo -e "\033[0;32;48m[Net]\033[1;0m $rtm"
echo -e "\033[0;35;48m[Loc]\033[1;0m $ltm"
