#!/bin/bash
# Date : 	2009/10/27 16:09:58
# Name : 	dirtry.sh

# File and directory's access
declare FILE_MOD='664' #rw-r-----
declare DIR_MOD='755'  #rwxr-x---

# Use chmod to changing file model.
chmod_item()
{
	if [[ -d ${1} ]]
	then
		echo "[D] ${1}"
		chmod $DIR_MOD ${1}
	else
		echo "[F] ${1}"
		chmod $FILE_MOD ${1}
	fi
}

# Recursion
trave_dirs()
{
	# Get file list
	[[ -z ${1} ]] && return 1
	[[ -d ${1} ]] || return 2

	pushd ${1} > /dev/null
	for it in *
	do
		chmod_item $it
		if [[ -d $it ]]
		then
			echo "[>] $it scanning ..."
			trave_dirs $it
		fi
	done
	popd > /dev/null
}

# Scripts entry
[[ -z $1 ]] || FILE_MOD=$1
[[ -z $2 ]] || DIR_MOD=$2
trave_dirs $(pwd)
