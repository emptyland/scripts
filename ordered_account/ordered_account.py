#!/usr/bin/python2

import re
import csv
import sys
import string

def ordered_cmp_fn(lhs, rhs):
	if lhs[0] < rhs[0]:
		return -1
	elif lhs[0] > rhs[0]:
		return 1
	return 0

def make_ordered_dict(input_file, limited):
	row_reader = csv.reader(input_file, dialect='excel')
	ordered = {}
	count = 0
	for i in row_reader:
		count = count + 1
		if count >= limited:
			break
		if re.match('.*\.com', i[1]):
			ordered[i[1]] = string.atoi(i[0])
	return ordered

def transform_account_info(lhs, rhs):
	account_info = []
	newname_info = []
	for k in rhs:
		if lhs.has_key(k):
			account_info.append([lhs[k] - rhs[k], k])
		else:
			newname_info.append([rhs[k], k])
	account_info.sort(cmp = ordered_cmp_fn, reverse = True)
	newname_info.sort(cmp = ordered_cmp_fn, reverse = True)
	return (account_info, newname_info)

def output_account_info(output_file, info):
	row_writer = csv.writer(output_file, dialect='excel')
	for i in info[0]:
		row_writer.writerow(i)
	row_writer.writerow(['', '=========New Domain Names:========'])
	for i in info[1]:
		row_writer.writerow(i)

if __name__ == '__main__':
	last_file = open(sys.argv[1], 'rb')
	newer_file = open(sys.argv[2], 'rb')
	limited = string.atoi(sys.argv[3])
	ordered_last = make_ordered_dict(last_file, limited)
	ordered_newer = make_ordered_dict(newer_file, limited)
	last_file.close()
	newer_file.close()

	info = transform_account_info(ordered_last, ordered_newer)
	output_file = open('result.csv', 'wb')
	output_account_info(output_file, info)
	output_file.close()

