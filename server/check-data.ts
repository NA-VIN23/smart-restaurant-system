
import { db } from './src/db';

async function checkData() {
    try {
        console.log('Checking database content...');
        const [rows]: any = await db.query('SELECT * FROM restaurant_tables');
        console.log(`Found ${rows.length} tables in the database.`);
        // console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error querying database:', error);
        process.exit(1);
    }
}

checkData();
