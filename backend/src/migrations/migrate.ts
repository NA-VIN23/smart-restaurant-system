import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { DB_CONFIG } from '../config';

async function migrate() {
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server for migrations');

    // Ensure database exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
    await connection.query(`USE \`${DB_CONFIG.database}\`;`);

    // Run schema (this is a simple migration runner that ensures base schema exists)
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);

    console.log('✅ Migrations applied (schema.sql)');
    await connection.end();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message || err);
    if (connection) await connection.end().catch(console.error);
    process.exit(1);
  }
}

migrate().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});
