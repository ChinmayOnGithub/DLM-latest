-- mysql-init.sql

CREATE DATABASE IF NOT EXISTS netflix_db;

USE netflix_db;

-- Create a user to access the database
CREATE USER 'netflix_user'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON netflix_db.* TO 'netflix_user'@'%';
FLUSH PRIVILEGES;

-- Create a sample table for logs
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
