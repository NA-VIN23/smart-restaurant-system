
CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- 1. Users Table (Handles Customer, Manager, Admin)

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Manager', 'Admin') NOT NULL, 
    contact_info VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL, -- Required for login
    password VARCHAR(255) NOT NULL,     -- Required for login
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tables & Reservations Table (The "Simple Relation")
[cite_start]-- Source: PDF Section 6 [cite: 185-193]
CREATE TABLE restaurant_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    type ENUM('Regular', 'VIP') DEFAULT 'Regular',
    status ENUM('Available', 'Occupied', 'Reserved') DEFAULT 'Available',
    
    -- Foreign Key linking to Users table
    current_customer_id INT NULL,
    reservation_time DATETIME NULL,
    
    FOREIGN KEY (current_customer_id) REFERENCES users(id) ON DELETE SET NULL
);