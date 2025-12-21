
import { db } from './src/db';

async function createQueueTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS queue_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                name VARCHAR(255),
                party_size INT NOT NULL,
                status ENUM('waiting', 'seated', 'cancelled') DEFAULT 'waiting',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ queue_entries table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        process.exit();
    }
}

createQueueTable();
