const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password', // fallback or empty
    database: process.env.DB_NAME || 'restaurant_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    // Check Columns
    connection.query('DESCRIBE queue_entries', (error, results) => {
        if (error) throw error;
        console.log('--- Columns ---');
        console.log(results);

        // Check Foreign Keys
        const fkQuery = `
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE 
        TABLE_SCHEMA = '${process.env.DB_NAME || 'restaurant_db'}' AND 
        TABLE_NAME = 'queue_entries' AND
        REFERENCED_TABLE_NAME IS NOT NULL;
    `;

        connection.query(fkQuery, (error, fkResults) => {
            if (error) throw error;
            console.log('--- Foreign Keys ---');
            console.log(fkResults);
            connection.end();
        });
    });
});
