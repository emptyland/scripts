#!/bin/bash
# Date : 	2010/07/29 21:38:58
# Name : 	dirtry.sh

# Recursion
trave_dirs()
{
	# Get file list
	[[ -z ${1} ]] && return 1
	[[ -d ${1} ]] || return 2
	[[ -z ${2} ]] && return 3

	pushd ${1} > /dev/null
	for it in *
	do
		chown $2 $it
		if [[ -d $it ]]
		then
			echo "[>] $it scanning ..."
			trave_dirs $it $2
		fi
	done
	popd > /dev/null
}

# Scripts entry
trave_dirs $(pwd) $1
