"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/init-db.ts
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
async function initializeDatabase() {
    let connection;
    try {
        // Create a connection to the MySQL server without specifying the database
        connection = await promise_1.default.createConnection({
            host: config_1.DB_CONFIG.host,
            user: config_1.DB_CONFIG.user,
            password: config_1.DB_CONFIG.password,
            port: config_1.DB_CONFIG.port,
            multipleStatements: true
        });
        console.log('✅ Connected to MySQL server');
        // Create the database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config_1.DB_CONFIG.database}\`;`);
        console.log(`✅ Database '${config_1.DB_CONFIG.database}' is ready`);
        // Switch to the database
        await connection.query(`USE \`${config_1.DB_CONFIG.database}\`;`);
        // Read and execute the schema file
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        console.log('🚀 Executing database schema...');
        await connection.query(schema);
        console.log('✅ Database schema created successfully');
        console.log('🌐 Database URL:', `${config_1.DB_CONFIG.host}:${config_1.DB_CONFIG.port}/${config_1.DB_CONFIG.database}`);
        // Close the connection
        await connection.end();
        console.log('👋 Connection closed');
        process.exit(0);
    }
    catch (error) {
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
//# sourceMappingURL=init-db.js.map