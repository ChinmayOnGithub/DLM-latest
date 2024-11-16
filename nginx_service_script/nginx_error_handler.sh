#!/bin/bash

# Function to check nginx logs and handle errors
check_nginx_logs() {
    echo "Checking logs of the container with ID: $CONTAINER_ID..."

    # Get the last 100 lines of the container's logs
    logs=$(docker logs --tail 100 $CONTAINER_ID 2>&1)

    # Check for "502 Bad Gateway" error
    if echo "$logs" | grep -q "502 Bad Gateway"; then
        echo "Detected 502 Bad Gateway error in logs."
        ./handle_502_bad_gateway.sh
    fi

    # Check for "Permission Denied" error
    if echo "$logs" | grep -q "Permission denied"; then
        echo "Detected Permission Denied error in logs."
        ./handle_permission_denied.sh
    fi

    # Check for "Connection Refused" error
    if echo "$logs" | grep -q "Connection refused"; then
        echo "Detected Connection Refused error in logs."
        ./handle_connection_refused.sh
    fi
}

# Function to find or create the nginx container
find_or_create_nginx_container() {
    echo "Searching for any running or stopped Nginx containers..."

    # Find the container ID of the nginx container (running or stopped)
    CONTAINER_ID=$(docker ps -a --filter "ancestor=nginx" --format "{{.ID}}" | head -n 1)

    if [ -z "$CONTAINER_ID" ]; then
        echo "No nginx container found. Creating a new nginx container..."

        # Create and run a new nginx container
        docker run --name nginx-container -d nginx
        CONTAINER_ID=$(docker ps -a --filter "name=nginx-container" --format "{{.ID}}")

        if [ -z "$CONTAINER_ID" ]; then
            echo "Failed to create the nginx container."
            exit 1
        else:
            echo "New Nginx container created with ID: $CONTAINER_ID"
        fi
    else
        echo "Found existing Nginx container with ID: $CONTAINER_ID"
    fi
}

# Main logic
echo "Starting nginx error handling script..."

# Find or create the nginx container
find_or_create_nginx_container

# Check if the nginx container is running
container_status=$(docker inspect -f '{{.State.Running}}' $CONTAINER_ID 2>/dev/null)

if [ "$container_status" == "false" ]; then
    echo "Nginx container is not running. Starting the container..."
    ./handle_container_restart.sh $CONTAINER_ID
    check_nginx_logs
else
    echo "Nginx container is running normally."
    check_nginx_logs
fi

