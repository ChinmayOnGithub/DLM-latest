#!/bin/bash

# Custom recovery script, receives container ID as argument
container_id=$1

echo "Running recovery actions for container $container_id..."

# Example: Restart the unhealthy container
docker restart $container_id

# You can add any additional actions, such as logging or sending notifications
