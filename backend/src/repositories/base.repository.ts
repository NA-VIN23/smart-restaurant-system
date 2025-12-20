import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

export abstract class BaseRepository<T> {
	protected table: string;
	protected pool = pool;

	constructor(table: string) {
		this.table = table;
	}

	async findById(id: number): Promise<T | null> {
		const [rows] = await this.pool.query<RowDataPacket[]>(`SELECT * FROM \`${this.table}\` WHERE id = ?`, [id]);
		return rows[0] ? (rows[0] as unknown as T) : null;
	}

	async findAll(): Promise<T[]> {
		const [rows] = await this.pool.query<RowDataPacket[]>(`SELECT * FROM \`${this.table}\``);
		return rows as unknown as T[];
	}

	async delete(id: number): Promise<boolean> {
		const [result] = await this.pool.query(`DELETE FROM \`${this.table}\` WHERE id = ?`, [id]);
		return (result as any).affectedRows > 0;
	}
}

