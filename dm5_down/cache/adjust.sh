
#!/bin/bash

[[ ! -d ${1} ]] && exit 1

mkdir ${1}/target > /dev/null

for i in ${1}/*; do
	echo ${i} | grep -P "${2} 第\d{1,3}话"
	[[ $? == "0" ]] || continue
	num=$(echo "${i}" | grep -P "\d{1,3}" -o)
	echo ${num}
	cd "${i}"
	for j in $(ls); do
		nam=$(printf "../target/%03d-%s" ${num} ${j})
		cp ${j} ${nam}
	done
	cd - > /dev/null
done
