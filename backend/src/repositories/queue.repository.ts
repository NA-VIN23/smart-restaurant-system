
import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

export class QueueRepository {
	private pool = pool;

	async findActive() {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM queue WHERE status = ? ORDER BY queue_position', ['waiting']);
		return rows as any[];
	}

	async findByUser(userId: number) {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM queue WHERE user_id = ?', [userId]);
		return rows as any[];
	}

	async addToQueue(entry: { user_id: number; party_size: number; status?: string }) {
		// Determine next position
		const [countRows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM queue WHERE status = ?', ['waiting']);
		const position = (countRows[0]?.count || 0) + 1;
		const [result] = await this.pool.query('INSERT INTO queue (user_id, party_size, status, queue_position, estimated_wait_time) VALUES (?, ?, ?, ?, ?)', [entry.user_id, entry.party_size, entry.status || 'waiting', position, null]);
		const insertId = (result as any).insertId;
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM queue WHERE id = ?', [insertId]);
		return rows[0] ? (rows[0] as any) : null;
	}

	async findById(id: number) {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM queue WHERE id = ?', [id]);
		return rows[0] ? (rows[0] as any) : null;
	}

	async updatePosition(id: number, newPosition: number) {
		const [result] = await this.pool.query('UPDATE queue SET queue_position = ? WHERE id = ?', [newPosition, id]);
		return (result as any).affectedRows > 0;
	}

	async updateStatus(id: number, status: string) {
		const [result] = await this.pool.query('UPDATE queue SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
		return (result as any).affectedRows > 0;
	}

	async recalculateWaitTimes() {
		// Simple recalculation: estimated_wait_time = position * 15
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM queue WHERE status = ? ORDER BY queue_position', ['waiting']);
		for (const r of rows as any[]) {
			const est = r.queue_position * 15;
			await this.pool.query('UPDATE queue SET estimated_wait_time = ? WHERE id = ?', [est, r.id]);
		}
		return true;
	}

	async getQueueStats() {
		const [countRows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM queue WHERE status = ?', ['waiting']);
		const total = countRows[0]?.count || 0;
		// Estimate total wait time as total * average seating (15 min)
		return { total_waiting: total, estimated_wait_time: total * 15 };
	}

	async getPositionAheadCount(position: number) {
		const [rows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM queue WHERE status = ? AND queue_position < ?', ['waiting', position]);
		return rows[0]?.count || 0;
	}
}

export const queueRepository = new QueueRepository();

