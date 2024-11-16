#!/bin/bash
echo "Handling Permission Denied error..."

# Change the ownership of the necessary files
docker exec nginx-container chown -R www-data:www-data /var/www/html

# Restart the nginx container after changing ownership
docker restart nginx-container

if [ $? -eq 0 ]; then
    echo "Permission Denied error handled successfully! Nginx container restarted."
else
    echo "Failed to fix the permission issue. Please check the system."
    exit 1
fi

