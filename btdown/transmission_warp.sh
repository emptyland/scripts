#!/bin/bash
# Date : 	2010/08/12 22:13:23
# Name : 	transmission_warp.sh


if [[ -n $(pgrep transmission) ]]
then
	transmission $1
else
	nohup transmission $1 > /dev/null & 
	sleep 4
fi

