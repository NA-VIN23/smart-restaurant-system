const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'restaurant_db'
});

connection.connect(async (err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected to database.');

    try {
        // 1. Check if FK exists
        const checkFkQuery = `
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'restaurant_db'}' 
        AND TABLE_NAME = 'queue_entries' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY';
      `;

        connection.query(checkFkQuery, (err, results) => {
            if (err) throw err;

            const hasFk = results.some(row => row.CONSTRAINT_NAME.includes('user_id') || row.CONSTRAINT_NAME.includes('queue_entries_ibfk'));

            if (hasFk) {
                console.log('✅ Foreign Key already exists.');
                process.exit(0);
            } else {
                console.log('⚠️ Foreign Key missing. Adding it now...');

                // 2. Add FK
                // Ensure user_id has same type as users.id (usually INT or INT UNSIGNED)
                // We'll trust it's INT. If users.id is UNSIGNED, we might need to alter column first.
                // Safest is to try adding constraint directly.

                const alterQuery = `
                ALTER TABLE queue_entries
                ADD CONSTRAINT fk_queue_user_id
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
              `;

                connection.query(alterQuery, (err, result) => {
                    if (err) {
                        console.error('❌ Error adding Foreign Key:', err.message);
                    } else {
                        console.log('✅ Foreign Key added successfully!');
                    }
                    process.exit(0);
                });
            }
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
