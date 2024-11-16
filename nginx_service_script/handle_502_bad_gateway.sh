#!/bin/bash
echo "Handling 502 Bad Gateway error..."

# Restart the nginx container to resolve the issue
docker restart nginx-container

if [ $? -eq 0 ]; then
    echo "502 Bad Gateway error handled successfully! Nginx container restarted."
else
    echo "Failed to restart the nginx container. Please check the system."
    exit 1
fi

