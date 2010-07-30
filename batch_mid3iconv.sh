#!/bin/bash
# Date : 	2010/07/29 21:38:58
# Name : 	dirtry.sh

# Recursion
trave_dirs()
{
	# Get file list
	local encoding

	if [[ -z $2 ]]
	then
		encoding="gbk"
	else
		encoding=$2
	fi
		
	pushd ${1} > /dev/null
	for it in *
	do
		if [[ -d $it ]]
		then
			echo "[>] $it scanning ..."
			trave_dirs $it $encoding
		else
			if [[ $(echo $it | grep ".*\.mp3$") ]]
			then
				mid3iconv -e $encoding --remove-v1 $it
			fi
		fi
	done
	popd > /dev/null
}

# Scripts entry
trave_dirs $(pwd) $1
