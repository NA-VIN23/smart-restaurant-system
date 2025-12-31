
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'restaurant_db',
};

async function migrate() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Modify the ENUM column to include 'Cancelled'
        const alterQuery = "ALTER TABLE reservations MODIFY COLUMN status ENUM('Pending', 'Approved', 'Declined', 'Cancelled') DEFAULT 'Pending'";
        await connection.query(alterQuery);
        console.log("Updated 'status' column to include 'Cancelled'.");

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
