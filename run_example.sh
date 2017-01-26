#!/bin/bash

gnome-terminal -e "node src/master/master.js"
for i in `seq 1 8`;
do
    gnome-terminal -e "node src/worker/worker.js http://localhost:3000 localhost"
done

sleep 3

node examples/single/client.js  http://localhost:3000 10000
