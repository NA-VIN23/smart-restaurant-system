-- Create the database
CREATE DATABASE IF NOT EXISTS restaurant_management;
USE restaurant_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'manager', 'admin') NOT NULL DEFAULT 'customer',
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    capacity INT NOT NULL,
    type ENUM('regular', 'vip') NOT NULL DEFAULT 'regular',
    status ENUM('available', 'occupied', 'reserved') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    table_id INT NOT NULL,
    reservation_time DATETIME NOT NULL,
    party_size INT NOT NULL,
    status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show') NOT NULL DEFAULT 'confirmed',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);

-- Queue table for walk-in customers
CREATE TABLE IF NOT EXISTS queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    party_size INT NOT NULL,
    status ENUM('waiting', 'seated', 'cancelled', 'no-show') NOT NULL DEFAULT 'waiting',
    queue_position INT NOT NULL,
    estimated_wait_time INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user
-- Password placeholder; application should hash the actual password
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@restaurant.com', '$2a$12$YOUR_HASHED_PASSWORD', 'admin')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert some sample tables
INSERT INTO tables (table_number, capacity, type, status) VALUES
(1, 2, 'regular', 'available'),
(2, 4, 'regular', 'available'),
(3, 6, 'regular', 'available'),
(4, 8, 'vip', 'available'),
(5, 4, 'vip', 'available')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
