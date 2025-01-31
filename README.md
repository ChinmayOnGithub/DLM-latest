# Project README

## Project Overview

This project focuses on creating a comprehensive logging and monitoring system using **Elasticsearch**, **Logstash**, and **Filebeat**. The primary deployment environment is **Kubernetes (Minikube)**. Additionally, the project involves containerizing services using **Docker** and deploying those images. This work is part of a broader initiative that includes chatbot development, demo website deployment, and `kubectl` scripting.

## Key Components and Management

### Elasticsearch

* **Role:** Centralized search and analytics engine for log storage and analysis.
* **Access:** Available at `http://localhost:9200`
* **Cluster:** Named "elasticsearch" by default
* **Version:** 8.15.2

#### Password Management
* To **reset the password for the `elastic` user**, run:  
  `sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic`
* The new password will be displayed in the console.
* Example passwords: `gwQRYgxNUOxsJ9sgyxjo` or `elk123`

#### Monitoring and Administration
* Check Elasticsearch health:  
  `curl -u elastic:password -X GET "localhost:9200/"`
* List all indices:  
  `curl -u elastic:elk123 'http://localhost:9200/_cat/indices?v'`
* Delete a specific index:  
  `curl -u elastic:elk123 -X DELETE "localhost:9200/your_index_name"`

#### File Permissions
Ensure proper file permissions for Elasticsearch with:  
`sudo chown -R elasticsearch:elasticsearch /var/lib/elasticsearch/ /etc/elasticsearch/`

### Logstash

* **Role:** Data processing pipeline for receiving, transforming, and forwarding logs to Elasticsearch.

#### Configuration
* Edit Logstash configuration:  
  `sudo nano /etc/logstash/conf.d/logstash.conf`  
  OR  
  `sudo code /etc/logstash/conf.d/logstash.conf --no-sandbox --user-data-dir`
* Test configuration:  
  `sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/logstash.conf --config.test_and_exit`  
  OR  
  `logstash -f your_logstash_config.conf --log.level debug`

#### Monitoring and Control
* Check health:  
  `http://localhost:9600/_node/stats`
* Restart service:  
  `sudo systemctl restart logstash`
* Check service status:  
  `sudo systemctl status logstash`

### Filebeat

* **Role:** Lightweight log shipper that collects and forwards logs to Logstash or Elasticsearch.

#### Configuration
* Edit configuration file:  
  `sudo nano /etc/filebeat/filebeat.yml`  
  OR  
  `sudo code /etc/filebeat/filebeat.yml --no-sandbox --user-data-dir`

#### Monitoring and Control
* Restart service:  
  `sudo systemctl restart filebeat`
* Check service status:  
  `sudo systemctl status filebeat`

### Docker

* **Role:** Containerization platform for application components.

#### Docker Compose Management
* Start stack:  
  `docker-compose up -d`
* Stop stack:  
  `docker-compose down`
* Stop and remove orphaned containers:  
  `docker-compose down --remove-orphans`
* List all containers:  
  `docker ps -a`
* Remove unwanted containers:  
  `docker rm <container_id>`
* Disconnect containers from a network:  
  `docker network disconnect elk_my-network`
* Remove a network:  
  `docker network rm elk_my-network`
* Rebuild images:  
  `docker-compose up --build -d`

### Docker Hub

* **Role:** Service to store and share Docker images.

#### Image Tagging
* Tag images:  
  `docker tag cluster-log-manager chinmayondocker/cluster-log-manager:v1.0`  
  OR  
  `docker tag cluster-log-manager chinmayondocker/cluster-log-manager:latest`

#### Pushing Images
* Push images:  
  `docker push chinmayondocker/cluster-log-manager:v1.0`  
  OR  
  `docker push chinmayondocker/cluster-log-manager:latest`

### Kubernetes (Minikube)

* **Role:** Local single-node Kubernetes environment for testing and development.

#### Pod Management
* List all pods in all namespaces:  
  `kubectl get pods --all-namespaces`
* List pods in a specific namespace:  
  `kubectl get pods --namespace=<namespace_name>`

*Note:* The log collector daemon process and its systemd configuration may not be necessary for a full Kubernetes cluster but can be used with Minikube.

## Accessing and Filtering Logs

* Logs can be accessed using URLs such as:
  * `http://localhost:9200/minikube-logs/_search?pretty`
  * `http://localhost:9200/minikube-logs-2024.10.17/_search?pretty`
  * `http://localhost:9200/rrr-logs/_search?pretty`
  * `http://localhost:9200/team-logs/_search?pretty&q=*`

#### Filtering Logs
To search for error messages:  
```bash
curl -u elastic:elk123 -X GET "localhost:9200/minikube-logs-2024.10.17/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{ "query": { "match": { "message": "error" } } }'
```

## Troubleshooting and Common Issues

### Service Status
* Check service status:  
  `sudo systemctl status <service>`  
  Example:  
  `sudo systemctl status filebeat`

### Network Issues
* Allow traffic on port `5044/tcp`:  
  `sudo ufw allow 5044/tcp`

### Logstash Configuration
* Test configuration:  
  `sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/logstash.conf --config.test_and_exit`

### Elasticsearch Permissions
* Ensure proper file permissions:  
  `sudo chown -R elasticsearch:elasticsearch /var/lib/elasticsearch/ /etc/elasticsearch/`

## Project Tasks

* **Chinmnay Patil:** Responsible for demo website deployment and connecting Minikube, Logstash, and Elasticsearch.
* **Pradnyanand Jade:** Responsible for chatbot development.
* **Omkar Patange:** Responsible for `kubectl` scripting.
* **Chaitanya Moti:** Responsible for post-Elasticsearch setup tasks.

