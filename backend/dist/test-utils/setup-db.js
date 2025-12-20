"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = setupDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
async function setupDatabase() {
    let connection;
    try {
        connection = await promise_1.default.createConnection({
            host: config_1.DB_CONFIG.host,
            user: config_1.DB_CONFIG.user,
            password: config_1.DB_CONFIG.password,
            port: config_1.DB_CONFIG.port,
            multipleStatements: true,
        });
        // Create database if not exists and run schema
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config_1.DB_CONFIG.database}\`;`);
        await connection.query(`USE \`${config_1.DB_CONFIG.database}\`;`);
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error setting up database for tests:', err);
        throw new Error(`Failed to connect/create database. Ensure MySQL is running and DB config is correct. Original error: ${err.message}`);
    }
    finally {
        if (connection)
            await connection.end();
    }
}
//# sourceMappingURL=setup-db.js.map