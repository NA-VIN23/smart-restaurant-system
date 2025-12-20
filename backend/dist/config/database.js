"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = exports.pool = void 0;
exports.testConnection = testConnection;
// src/config/database.ts
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'restaurant_management',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
exports.DB_CONFIG = DB_CONFIG;
const pool = promise_1.default.createPool(DB_CONFIG);
exports.pool = pool;
// Test the database connection
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
    finally {
        if (connection)
            connection.release();
    }
}
exports.default = pool;
//# sourceMappingURL=database.js.map