#!/bin/bash
# Date : 	2009/10/28 11:12:03
# Name : 	blank_rename.sh

# $1 : name for check
check_rename_file()
{
	local new_name
	local old_name

	old_name=${!1}

	if [[ $old_name =~ " " ]]
	then
		# Delete all of space
		new_name=$(echo $old_name | sed -e 's/^ //' -e 's/ /_/g')
		echo "[+] $old_name -> $new_name"
	
		# Real rename file
		# old_name to new_name
		mv "$old_name" "$new_name"
		if [[ $? != 0 ]]
		then
			echo "[-] Cannot rename $old_name"
		else
			eval "$1='$new_name'" # Return the new name.
		fi
	fi
}

# $1 : Directory for beginning
traverse_dir()
{
	pushd $1 > /dev/null
	[[ $? != '0' ]] && return 1

	local name
	for it in *
	do
		# Check and rename the file
		name=$it
		check_rename_file name

		# Inter the other loop :
		if [[ -d $name ]]
		then
			echo "[>] $name scanning ..."
			traverse_dir $name
		fi
	done

	popd > /dev/null
}

#stub=" 1 2 .exe"
#check_rename_file stub
#exit 0

# Script entry :
if [[ -z ${1} ]]
then
	traverse_dir $(pwd)
else
	[[ -d ${1} ]] || return 1
	traverse_dir ${1}
fi

