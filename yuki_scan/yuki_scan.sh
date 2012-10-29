#!/bin/bash

function depend_for() {
	for i in $(echo ${1}); do
		[[ -f ${i} ]] && echo ${i}
	done
}

function depend() {
	local incs=$(grep -P "^#include \".*\"$" ${1} | awk -F" " '{print $2}' | uniq)
	local deps=${1}
	incs=$(echo ${incs} | sed -e "s/\"//g")

	for i in $(echo ${incs}); do
		[[ -f ${i} ]] && incs="${incs} $(depend ${i})"
	done
	deps="${deps} $(depend_for "${incs}" | sort | uniq)"
	echo ${deps}
}

depend ${1}