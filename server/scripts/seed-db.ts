import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

dotenv.config();

async function run() {
  try {
    const sqlPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('Schema file not found at', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Running schema SQL...');
    await connection.query(sql);
    console.log('✅ Database schema applied / seeded successfully');
    await connection.end();
  } catch (err) {
    console.error('❌ Failed to run schema:', err);
    process.exit(1);
  }
}

run();
