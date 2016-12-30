#!/bin/bash

gnome-terminal -e "node master.js"
gnome-terminal -e "node worker.js http://localhost:3000"
gnome-terminal -e "node worker.js http://localhost:3000"
gnome-terminal -e "node worker.js http://localhost:3000"

sleep 1

java -jar data-generator.jar 50 | node client.js  http://localhost:3000
