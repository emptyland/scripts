#!/bin/bash

cd /var/lib/spigot && java -Xms1024M -Xmx1024M -XX:+UseG1GC -jar /spigot/spigot-*.jar nogui
