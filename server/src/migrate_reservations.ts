
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

        const createTableQuery = `
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
            )
        `;

        await connection.query(createTableQuery);
        console.log('Reservations table created successfully.');

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
