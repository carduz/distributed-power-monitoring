#!/bin/bash

gnome-terminal -e "node master.js"
for i in `seq 1 8`;
do
    gnome-terminal -e "node worker.js http://localhost:3000"
done

sleep 3

node client.js  http://localhost:3000 10000
