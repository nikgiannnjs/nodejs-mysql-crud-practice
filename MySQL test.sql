CREATE DATABASE issues

USE issues;


CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500),
    description VARCHAR(500),
    active BOOLEAN
);

