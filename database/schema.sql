
CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- 1. Users Table (Handles Customer, Manager, Admin)

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Manager', 'Admin') NOT NULL, 
    contact_info VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL, -- Required for login
    password VARCHAR(255) NOT NULL,     -- Required for login
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tables & Reservations Table (The "Simple Relation")
CREATE TABLE IF NOT EXISTS restaurant_tables (
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

-- 3. Queue Entries Table
CREATE TABLE IF NOT EXISTS queue_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(255),
    party_size INT NOT NULL,
    status ENUM('waiting', 'seated', 'cancelled') DEFAULT 'waiting',
    customer_type ENUM('Regular', 'VIP') DEFAULT 'Regular',
    table_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL
);

-- 4. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    party_size INT NOT NULL,
    customer_type ENUM('Regular', 'VIP') DEFAULT 'Regular',
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(20) NOT NULL,
    status ENUM('Pending', 'Approved', 'Declined') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);