#!/bin/bash

gnome-terminal -e "node master.js"
for i in `seq 1 6`;
do
    gnome-terminal -e "node worker.js http://localhost:3000"
done

sleep 3

node client.js  http://localhost:3000 1
