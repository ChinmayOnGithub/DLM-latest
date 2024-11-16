#!/bin/bash

# Loop to check container status every 10 seconds
while true; do
    # Get the list of unhealthy or stopped containers
    unhealthy_containers=$(docker ps --filter 'health=unhealthy' --format '{{.ID}}')
    stopped_containers=$(docker ps -a --filter 'status=exited' --format '{{.ID}}')

    # Check for unhealthy containers
    if [[ ! -z "$unhealthy_containers" ]]; then
        for container in $unhealthy_containers; do
            echo "Container $container is unhealthy, running appropriate recovery script..."
            
            # Example: Call the recovery script for a 502 Bad Gateway error
            ./handle_502_bad_gateway.sh $container
        done
    fi

    # Check for stopped containers
    if [[ ! -z "$stopped_containers" ]]; then
        for container in $stopped_containers; do
            echo "Container $container has stopped, running container restart script..."
            
            # Restart the stopped container
            docker restart $container

            # Optionally call a script to handle restart scenarios
            ./handle_container_restart.sh $container
        done
    fi

    # Sleep for 10 seconds before checking again
    sleep 10
done
