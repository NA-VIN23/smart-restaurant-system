"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableRepository = exports.TableRepository = void 0;
// src/repositories/table.repository.ts
const base_repository_1 = require("./base.repository");
class TableRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('tables');
    }
    async findByTableNumber(tableNumber) {
        const [rows] = await this.pool.query('SELECT * FROM tables WHERE table_number = ?', [tableNumber]);
        return rows[0] ? this.mapRowToEntity(rows[0]) : null;
    }
    async findAvailable(capacity, type) {
        let query = 'SELECT * FROM tables WHERE status = "AVAILABLE"';
        const params = [];
        if (capacity) {
            query += ' AND capacity >= ?';
            params.push(capacity);
        }
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        query += ' ORDER BY capacity ASC'; // Prefer smaller tables first
        const [rows] = await this.pool.query(query, params);
        return rows.map(this.mapRowToEntity);
    }
    async create(tableInput) {
        const { table_number, capacity, type, status = 'AVAILABLE' } = tableInput;
        const [result] = await this.pool.query('INSERT INTO tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?)', [table_number, capacity, type, status]);
        const tableId = result.insertId;
        return this.findById(tableId);
    }
    async update(id, updateData) {
        const updates = [];
        const params = [];
        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = ?`);
                params.push(value);
            }
        });
        if (updates.length === 0) {
            return this.findById(id);
        }
        const query = `UPDATE tables SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);
        const [result] = await this.pool.query(query, params);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.findById(id);
    }
    async updateStatus(id, status) {
        const [result] = await this.pool.query('UPDATE tables SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    }
    mapRowToEntity(row) {
        return {
            id: row.id,
            table_number: row.table_number,
            capacity: row.capacity,
            type: row.type,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }
}
exports.TableRepository = TableRepository;
exports.tableRepository = new TableRepository();
//# sourceMappingURL=table.repository.js.map