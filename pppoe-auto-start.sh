#!/bin/bash
# Date : 	2010/05/15 17:06:25
# Name : 	pppoe-auto-start

# Check pppoe link status.
pppoe-status | grep "pppoe-status: Link is up and running on interface"
[[ $? == "0" ]] && exit 1

# Connect pppoe.
sudo pppoe-start
[[ $? == "0" ]] || exit $?

# Set default gateway.
gateway=$(ifconfig ppp0 | grep "inet addr" | sed -e "s/^.*inet addr://" -e "s/P-t-P.*$//")
echo "Gateway will be : $gateway"
sudo route del default
sudo route add default gw $gateway
