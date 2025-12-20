import pool from '../config/database';

export async function clearTestData() {
  // Remove all test data (preserve admin if present by email)
  try {
    await pool.query('DELETE FROM reservations');
  } catch (e) {
    // ignore if table doesn't exist yet
    // log for visibility while running tests
    // console.warn('clearTestData reservations error', e);
  }
  try {
    await pool.query('DELETE FROM queue');
  } catch (e) { console.warn('clearTestData queue error', e); }
  try {
    await pool.query("DELETE FROM tables WHERE table_number NOT IN (1,2,3,4,5)");
  } catch (e) { console.warn('clearTestData tables error', e); }
  try {
    await pool.query("DELETE FROM users WHERE email NOT LIKE 'admin@%'");
  } catch (e) { console.warn('clearTestData users error', e); }
}

export async function closePool() {
  try {
    await pool.end();
  } catch (e) {
    // ignore
  }
}

export async function seedTables() {
  // ensure tables exist for tests
  await pool.query('INSERT INTO tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP', [100, 4, 'regular', 'available']);
  const [rows] = await pool.query('SELECT * FROM tables WHERE table_number = ?', [100]);
  return Array.isArray(rows) ? (rows[0] as any) : null;
}
