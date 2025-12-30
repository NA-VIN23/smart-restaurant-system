
import { db } from './db';

const migrate = async () => {
    try {
        console.log('Migrating queue_entries table...');
        await db.query(`
      ALTER TABLE queue_entries 
      ADD COLUMN table_id INT NULL,
      ADD CONSTRAINT fk_queue_table FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL;
    `);
        console.log('Migration successful');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column table_id already exists');
        } else {
            console.error('Migration failed:', error);
        }
    }
    process.exit();
};

migrate();
