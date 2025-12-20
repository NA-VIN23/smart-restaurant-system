"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class BaseRepository {
    constructor(table) {
        this.pool = database_1.default;
        this.table = table;
    }
    async findById(id) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${this.table}\` WHERE id = ?`, [id]);
        return rows[0] ? rows[0] : null;
    }
    async findAll() {
        const [rows] = await this.pool.query(`SELECT * FROM \`${this.table}\``);
        return rows;
    }
    async delete(id) {
        const [result] = await this.pool.query(`DELETE FROM \`${this.table}\` WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map