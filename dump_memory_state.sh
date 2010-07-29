#!/bin/bash

if [ $# -ne 1 ]
then
	echo "usage error";
	echo "$0 pid";
	exit 1;
fi

pid=$1
file=/proc/$pid/status
i=0;
lines=0;
kill -SIGWINCH $$
while :
do
	if [ ! -f $file ]
	then
		echo "process exit";
		break;
	fi

	if ((LINES > 0))
	then
		((lines = LINES - 1))
	else
		((lines = 20))
	fi

	if (( i % lines == 0 ))
	then
		echo -e "VmPeak\tVmSize\tVmLck\tVmHWM\tVmRSS\tVmData\tVmStk\tVmExe\tVmLib\tVmPTE\tThreads\tSigQ"
	fi

	awk '{
		if($1 ~ /^Vm/) {printf("%s\t", $2);}
		if($1 ~/^Threads:$/) {printf("%s\t", $2);}
		if($1 ~/^SigQ:$/) {printf("%s\t", $2);}
		}
		END{printf("\n");}' $file;
	((i++))
		sleep 1;
done
