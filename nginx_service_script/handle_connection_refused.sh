#!/bin/bash
echo "Handling Connection Refused error..."

# Check and restart the dependent services (e.g., backend server)
# Assuming a backend container is required for Nginx to function
docker restart backend-container

if [ $? -eq 0 ]; then
    echo "Connection Refused error handled successfully! Backend container restarted."
else
    echo "Failed to restart the backend container. Please check the system."
    exit 1
fi

# Restart nginx container
docker restart nginx-container

if [ $? -eq 0 ]; then
    echo "Nginx container restarted successfully!"
else
    echo "Failed to restart nginx container. Please check the system."
    exit 1
fi

