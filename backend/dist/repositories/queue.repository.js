"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueRepository = exports.QueueRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class QueueRepository {
    constructor() {
        this.pool = database_1.default;
    }
    async findActive() {
        const [rows] = await this.pool.query('SELECT * FROM queue WHERE status = ? ORDER BY queue_position', ['waiting']);
        return rows;
    }
    async findByUser(userId) {
        const [rows] = await this.pool.query('SELECT * FROM queue WHERE user_id = ?', [userId]);
        return rows;
    }
    async addToQueue(entry) {
        var _a;
        // Determine next position
        const [countRows] = await this.pool.query('SELECT COUNT(*) as count FROM queue WHERE status = ?', ['waiting']);
        const position = (((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0) + 1;
        const [result] = await this.pool.query('INSERT INTO queue (user_id, party_size, status, queue_position, estimated_wait_time) VALUES (?, ?, ?, ?, ?)', [entry.user_id, entry.party_size, entry.status || 'waiting', position, null]);
        const insertId = result.insertId;
        const [rows] = await this.pool.query('SELECT * FROM queue WHERE id = ?', [insertId]);
        return rows[0] ? rows[0] : null;
    }
    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM queue WHERE id = ?', [id]);
        return rows[0] ? rows[0] : null;
    }
    async updatePosition(id, newPosition) {
        const [result] = await this.pool.query('UPDATE queue SET queue_position = ? WHERE id = ?', [newPosition, id]);
        return result.affectedRows > 0;
    }
    async updateStatus(id, status) {
        const [result] = await this.pool.query('UPDATE queue SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    }
    async recalculateWaitTimes() {
        // Simple recalculation: estimated_wait_time = position * 15
        const [rows] = await this.pool.query('SELECT * FROM queue WHERE status = ? ORDER BY queue_position', ['waiting']);
        for (const r of rows) {
            const est = r.queue_position * 15;
            await this.pool.query('UPDATE queue SET estimated_wait_time = ? WHERE id = ?', [est, r.id]);
        }
        return true;
    }
    async getQueueStats() {
        var _a;
        const [countRows] = await this.pool.query('SELECT COUNT(*) as count FROM queue WHERE status = ?', ['waiting']);
        const total = ((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        // Estimate total wait time as total * average seating (15 min)
        return { total_waiting: total, estimated_wait_time: total * 15 };
    }
    async getPositionAheadCount(position) {
        var _a;
        const [rows] = await this.pool.query('SELECT COUNT(*) as count FROM queue WHERE status = ? AND queue_position < ?', ['waiting', position]);
        return ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
    }
}
exports.QueueRepository = QueueRepository;
exports.queueRepository = new QueueRepository();
//# sourceMappingURL=queue.repository.js.map