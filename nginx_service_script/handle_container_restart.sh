#!/bin/bash

# Check if a container ID is provided
if [ -z "$1" ]; then
    echo "Error: No container ID provided. Usage: ./handle_container_restart.sh <container_id>"
    exit 1
fi

CONTAINER_ID="$1"

echo "Attempting to start the container with ID: $CONTAINER_ID..."

# Start the container
docker start $CONTAINER_ID

if [ $? -eq 0 ]; then
    echo "Container with ID $CONTAINER_ID started successfully!"
else
    echo "Failed to start the container with ID $CONTAINER_ID. Please check the container logs for more details."
    exit 1
fi

