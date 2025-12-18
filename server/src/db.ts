import mysql from 'mysql2/promise'; // Using Promise version for modern async/await
import dotenv from 'dotenv';

dotenv.config(); // Load password from .env file

export const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password', // Replace if not using .env
    database: process.env.DB_NAME || 'restaurant_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Test the connection immediately
db.getConnection()
    .then(conn => {
        console.log('✅ MySQL Database Connected Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
    });