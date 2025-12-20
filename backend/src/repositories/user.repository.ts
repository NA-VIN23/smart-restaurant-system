import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

export class UserRepository {
	private pool = pool;

	async findById(id: number) {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
		return rows[0] ? (rows[0] as any) : null;
	}

	async findByEmail(email: string) {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
		return rows[0] ? (rows[0] as any) : null;
	}

	async create(user: { name: string; email: string; password: string; role?: string }) {
		const [result] = await this.pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [user.name, user.email, user.password, user.role || 'customer']);
		const insertId = (result as any).insertId;
		return this.findById(insertId);
	}
}

export const userRepository = new UserRepository();

