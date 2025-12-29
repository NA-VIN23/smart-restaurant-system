-- Smart Restaurant Queue & Table Management System
-- Database Schema

DROP DATABASE IF EXISTS restaurant_management;
CREATE DATABASE restaurant_management;
USE restaurant_management;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Manager', 'Admin') NOT NULL DEFAULT 'Customer',
    contact_info VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables & Reservations (Combined into one table as per requirement)
CREATE TABLE restaurant_tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    type ENUM('Regular', 'VIP') NOT NULL DEFAULT 'Regular',
    status ENUM('Available', 'Occupied', 'Reserved') NOT NULL DEFAULT 'Available',
    current_customer_id INT NULL,
    current_customer_name VARCHAR(100) NULL,
    reservation_time DATETIME NULL,
    queue_position INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_customer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_table_number (table_number),
    INDEX idx_reservation_time (reservation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (name, email, password, role, contact_info) VALUES
('Admin User', 'admin@restaurant.com', '$2b$10$rZ5LvVZvN7xJxH0YmK0KJ.VqxKqxHKqH0oHQZ3xGZ1F5zXn5K5B3C', 'Admin', '1234567890');

-- Insert default manager (password: Manager@123)
INSERT INTO users (name, email, password, role, contact_info) VALUES
('Manager User', 'manager@restaurant.com', '$2b$10$rZ5LvVZvN7xJxH0YmK0KJ.VqxKqxHKqH0oHQZ3xGZ1F5zXn5K5B3C', 'Manager', '9876543210');

-- Insert sample tables
INSERT INTO restaurant_tables (table_number, capacity, type, status) VALUES
('T1', 2, 'Regular', 'Available'),
('T2', 4, 'Regular', 'Available'),
('T3', 6, 'Regular', 'Available'),
('T4', 2, 'VIP', 'Available'),
('T5', 4, 'VIP', 'Available'),
('T6', 8, 'VIP', 'Available'),
('T7', 4, 'Regular', 'Available'),
('T8', 2, 'Regular', 'Available');

-- Create view for queue management
CREATE VIEW queue_view AS
SELECT 
    rt.id,
    rt.table_number,
    rt.capacity,
    rt.type,
    rt.queue_position,
    rt.current_customer_id,
    rt.current_customer_name,
    u.email as customer_email,
    u.contact_info as customer_contact,
    rt.created_at as joined_at
FROM restaurant_tables rt
LEFT JOIN users u ON rt.current_customer_id = u.id
WHERE rt.status = 'Reserved' AND rt.queue_position IS NOT NULL
ORDER BY rt.queue_position ASC;

-- Create view for analytics
CREATE VIEW table_analytics AS
SELECT 
    type,
    COUNT(*) as total_tables,
    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_tables,
    SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_tables,
    SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved_tables,
    ROUND(AVG(capacity), 2) as avg_capacity
FROM restaurant_tables
GROUP BY type;