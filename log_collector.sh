#!/bin/bash

# Log directory
LOG_DIR="/home/chinmay/MiniProject/Startup-sh-files/logs"
mkdir -p $LOG_DIR

# Declare pods and their namespaces
declare -A PODS
PODS=( ["mysql-namespace"]="mysql-pod" ["nginx-namespace"]="nginx-pod" )

while true; do
    for NAMESPACE in "${!PODS[@]}"; do
        POD="${PODS[$NAMESPACE]}"
        TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
        LOG_FILE="$LOG_DIR/$POD-$TIMESTAMP.log"
        
        # Collect logs from the pod in the specific namespace
        kubectl logs "$POD" -n "$NAMESPACE" --since=10s >> "$LOG_FILE" 2>&1
        # since will collect the logs since last 10s if any generated 
        # Delete the log file if it is empty
        if [ ! -s "$LOG_FILE" ]; then
            rm "$LOG_FILE"
        fi
    done
    sleep 10
# Adjust the sleep time as needed
done

