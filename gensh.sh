#!/bin/bash

if [ -z $1 ]
then
	echo 'Need a file name'
	exit 127
fi

echo '#!/bin/bash' > $1
echo -e "# Date : \t`date +\"%Y/%m/%d %H:%M:%S\"`" >> $1
echo -e "# Name : \t${1}" >> $1
echo >> $1
chmod +x $1

$EDITOR $1
