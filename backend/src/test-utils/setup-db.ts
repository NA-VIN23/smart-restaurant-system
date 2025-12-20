import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { DB_CONFIG } from '../config';

export async function setupDatabase() {
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
      multipleStatements: true,
    });

    // Create database if not exists and run schema
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
    await connection.query(`USE \`${DB_CONFIG.database}\`;`);

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error setting up database for tests:', err);
    throw new Error(
      `Failed to connect/create database. Ensure MySQL is running and DB config is correct. Original error: ${err.message}`
    );
  } finally {
    if (connection) await connection.end();
  }
}
