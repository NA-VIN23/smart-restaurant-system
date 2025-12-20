"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    constructor() {
        this.pool = database_1.default;
    }
    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] ? rows[0] : null;
    }
    async findByEmail(email) {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] ? rows[0] : null;
    }
    async create(user) {
        const [result] = await this.pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [user.name, user.email, user.password, user.role || 'customer']);
        const insertId = result.insertId;
        return this.findById(insertId);
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map