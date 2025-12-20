// src/scripts/init-db.ts
import mysql from 'mysql2/promise';
import { DB_CONFIG } from '../config';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function initializeDatabase() {
  let connection;
  try {
    // Create a connection to the MySQL server without specifying the database
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
    console.log(`✅ Database '${DB_CONFIG.database}' is ready`);

    // Switch to the database
    await connection.query(`USE \`${DB_CONFIG.database}\`;`);

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Executing database schema...');
    await connection.query(schema);
    
    console.log('✅ Database schema created successfully');
    console.log('🌐 Database URL:', `${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
    // Close the connection
    await connection.end();
    console.log('👋 Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:');
    console.error(error);
    
    // Make sure to close the connection if there's an error
    if (connection) {
      await connection.end().catch(console.error);
    }
    
    process.exit(1);
  }
}

// Run the initialization
console.log('🚀 Starting database initialization...');
initializeDatabase().catch(console.error);