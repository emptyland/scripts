#!/bin/bash

for i in `seq 16 255`; do printf "\e[38;5;%sm %s\t" $i $i;done;echo ""
