// src/repositories/table.repository.ts
import { BaseRepository } from './base.repository';
import { Table, TableInput, TableUpdateInput } from '../models/table.model';
import { RowDataPacket } from 'mysql2/promise';

export class TableRepository extends BaseRepository<Table> {
  constructor() {
    super('tables');
  }

  async findByTableNumber(tableNumber: string): Promise<Table | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM tables WHERE table_number = ?', 
      [tableNumber]
    );
    return rows[0] ? this.mapRowToEntity(rows[0]) : null;
  }

  async findAvailable(capacity?: number, type?: 'REGULAR' | 'VIP'): Promise<Table[]> {
    let query = 'SELECT * FROM tables WHERE status = "AVAILABLE"';
    const params: any[] = [];

    if (capacity) {
      query += ' AND capacity >= ?';
      params.push(capacity);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY capacity ASC'; // Prefer smaller tables first

    const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
    return rows.map(this.mapRowToEntity);
  }

  async create(tableInput: TableInput): Promise<Table> {
    const { table_number, capacity, type, status = 'AVAILABLE' } = tableInput;
    
    const [result] = await this.pool.query(
      'INSERT INTO tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?)',
      [table_number, capacity, type, status]
    );

    const tableId = (result as any).insertId;
    return this.findById(tableId) as Promise<Table>;
  }

  async update(id: number, updateData: TableUpdateInput): Promise<Table | null> {
    const updates: string[] = [];
    const params: any[] = [];

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

    if ((result as any).affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async updateStatus(id: number, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'): Promise<boolean> {
    const [result] = await this.pool.query(
      'UPDATE tables SET status = ? WHERE id = ?',
      [status, id]
    );
    return (result as any).affectedRows > 0;
  }

  protected mapRowToEntity(row: RowDataPacket): Table {
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

export const tableRepository = new TableRepository();