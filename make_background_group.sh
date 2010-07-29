#!/bin/bash
# Date : 	2009/11/03 21:12:05
# Name : 	make_background_group.sh

# Declare const pattern
declare -r PATTERN="^[0-9][0-9]*\.?[0-9]*[0-9]$"
declare -r PIC_FILE_PATTERN="\.((jpg)|(jpeg)|(png)|(bmp))$"

append_date_time()
{
	echo -e "\t<starttime>"
	echo -e "\t\t<year>$(date +%Y)</year>"
	echo -e "\t\t<month>$(date +%m)</month>"
	echo -e "\t\t<day>$(date +%d)</day>"
	echo -e "\t\t<hour>$(date +%H)</hour>"
	echo -e "\t\t<minute>$(date +%M)</minute>"
	echo -e "\t\t<second>$(date +%S)</second>"
	echo -e "\t</starttime>"
}

append_static_segment()
{
	echo -e "\t<static>"
	echo -e "\t\t<duration>$1</duration>"
	echo -e "\t\t<file>$2</file>"
	echo -e "\t</static>"
}

# $1 : t2
# $2 : from
# $3 : to
append_transition_segment()
{
	echo -e "\t<transition>"
	echo -e "\t\t<duration>$1</duration>"
	echo -e "\t\t<from>$2</from>"
	echo -e "\t\t<to>$3</to>"
	echo -e "\t</transition>"
}

# $1 : file name
# ref $2 : prev file name reference
# $3 : t1
# $4 : t2
append_segment()
{
	local from
	local to

	# Picture file only
	if [[ $1 =~ $PIC_FILE_PATTERN ]]
	then
		if [[ !(-z ${!2}) ]]
		then
			from="$(pwd)/${!2}"
			to="$(pwd)/$1"
			append_static_segment $3 $from
			append_transition_segment $4 $from $to
		fi

		# Return prev file name.
		eval "$2='$1'"
	fi
}

# $1 directory name
# $2 t1
# $3 t2
gen_background_conf()
{
	pushd $1 > /dev/null
	[[ $? != 0 ]] && return 3

	local back

	for it in *
	do
		if [[ -d $it ]]
		then
			gen_background_conf $it $2 $3
		else
			append_segment $it back $2 $3
		fi
	done

	popd > /dev/null
	[[ $? != 0 ]] && exit 4
	return 0
}




# script entry
declare dir
declare static_d
declare transition_d

# [dir] static-duration transition-duration
if [[ $# == 3 ]]
then
	dir=$1
	static_d=$2
	transition_d=$3
elif [[ $# == 2 ]]
then
	dir=$(pwd)
	static_d=$1
	transition_d=$2
else
	echo -n "[E] Usage($#) : command "
	echo "[dir] static-duration transition-duration"
	exit 1
fi


# Check all of arguments.
if [[ !(-d $dir) || !($static_d =~ $PATTERN) || !($transition_d =~ $PATTERN) ]]
then
	echo "[E] Arg failure"
	exit 2 # Invalid arguments.
fi

# Generate a XML document for background configure.
echo "<background>"
append_date_time
echo -e "\t<!-- This animation will start at midnight. -->"
gen_background_conf $dir $static_d $transition_d
echo "</background>"

exit 0
