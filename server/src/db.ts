import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),     // ✅ REQUIRED
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false          // ✅ REQUIRED FOR RAILWAY
    }
});

// Test the connection immediately
db.getConnection()
    .then(conn => {
        console.log('✅ MySQL Database Connected Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err);
    });
