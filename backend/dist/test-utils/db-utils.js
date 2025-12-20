"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTestData = clearTestData;
exports.seedTables = seedTables;
const database_1 = __importDefault(require("../config/database"));
async function clearTestData() {
    // Remove all test data (preserve admin if present by email)
    try {
        await database_1.default.query('DELETE FROM reservations');
    }
    catch (e) {
        // ignore if table doesn't exist yet
    }
    try {
        await database_1.default.query('DELETE FROM queue');
    }
    catch (e) { }
    try {
        await database_1.default.query("DELETE FROM tables WHERE table_number NOT IN (1,2,3,4,5)");
    }
    catch (e) { }
    try {
        await database_1.default.query("DELETE FROM users WHERE email NOT LIKE 'admin@%'");
    }
    catch (e) { }
}
async function seedTables() {
    // ensure tables exist for tests
    await database_1.default.query('INSERT INTO tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP', [100, 4, 'regular', 'available']);
    const [rows] = await database_1.default.query('SELECT * FROM tables WHERE table_number = ?', [100]);
    return Array.isArray(rows) ? rows[0] : null;
}
//# sourceMappingURL=db-utils.js.map