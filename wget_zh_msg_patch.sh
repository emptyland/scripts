#!/bin/bash
# Date : 	2010/10/04 17:04:18
# Name : 	wget_zh_msg_patch.sh

msgunfmt /usr/share/locale/zh_CN/LC_MESSAGES/wget.mo -o - | sed 's/eta(英国中部时间)/ETA/' | msgfmt - -o /tmp/zh_CN.mo
sudo cp /tmp/zh_CN.mo /usr/share/locale/zh_CN/LC_MESSAGES/wget.mo
