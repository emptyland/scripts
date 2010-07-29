#!/bin/bash
# Date : 	2010/04/25 14:03:04
# Name : 	batch_rename.sh


# Get the title
# $1 : full name.
# $2 : extend name.
get_title_name()
{
	local full_len
	local extend_len
	local title_len

	full_len=$(expr length $1)
	extend_len=$(expr length $2)
	
	let "title_len = $full_len - $extend_len"

	# Beginning index is 1, not 0.
	echo $(expr substr $1 1 $title_len)
}

# Get the number :
# $1 : title name.
get_number_from_title()
{
	local left_substr

	left_substr=$(echo $1 | awk -F"]" '{print $3 }')
	echo $(expr $left_substr : '.*\([0-9][0-9]$\)')
}

# $1 : prefix
# $2 : title name
# $3 : rip
# $4 : extend name
generate_patten_name()
{
	local number

	number=$(get_number_from_title $2)
	echo "${1}_${number}_${3}${4}"
}



# Entry
# $1 : Prefix
# $2 : RIP Type

prefix=${1-"Untitle"}
rip=${2-"RIP"}
is_test=${3-"-test"}

# Found all of video files
for file_name in $(ls | grep '[(.mkv)|(.avi)|(.rmvb)|(.rm)|(.mp4)]$')
do
	# Get extend name, patten : .[a-zA-Z0-9]*$
	extend=$(expr $file_name : '.*\(\.[a-zA-Z0-9]*$\)')

	title=$(get_title_name $file_name $extend)
	new=$(generate_patten_name $prefix $title $rip $extend)

	echo "$file_name -> $new"
	if [[ $is_test == "-rename" ]]
	then
		mv $file_name $new
	fi
done

