const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'restaurant_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected to database.');

    // Check if column exists
    const checkColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'restaurant_db'}' 
    AND TABLE_NAME = 'queue_entries' 
    AND COLUMN_NAME = 'customer_type';
  `;

    connection.query(checkColumnQuery, (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            console.log('✅ customer_type column already exists.');
            process.exit(0);
        } else {
            console.log('⚠️ customer_type column missing. Adding it now...');

            const alterQuery = `
            ALTER TABLE queue_entries
            ADD COLUMN customer_type ENUM('Regular', 'VIP') DEFAULT 'Regular' AFTER party_size;
        `;

            connection.query(alterQuery, (err, result) => {
                if (err) {
                    console.error('❌ Error adding column:', err.message);
                    process.exit(1);
                } else {
                    console.log('✅ customer_type column added successfully!');
                    process.exit(0);
                }
            });
        }
    });
});
