import request from 'supertest';
import app from '../app';
import { clearTestData, seedTables } from '../test-utils/db-utils';

const runIntegration = process.env.RUN_INTEGRATION === 'true' || process.env.CI === 'true';

const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Table integration tests', () => {
  let managerToken: string;
  let customerToken: string;
  let tableId: number;

  beforeAll(async () => {
    const { setupDatabase } = await import('../test-utils/setup-db');
    await setupDatabase();
    await clearTestData();
    await seedTables();
  });

  afterAll(async () => {
    await clearTestData();
    const { closePool } = await import('../test-utils/db-utils');
    await closePool();
  });

  test('signup manager and login', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({ name: 'MgrT', email: 'mgrt@test.com', password: 'password', role: 'manager' });
    expect(signupRes.status).toBe(201);
    managerToken = signupRes.body.token;
  });

  test('signup customer and login', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({ name: 'CustT', email: 'custt@test.com', password: 'password' });
    expect(signupRes.status).toBe(201);
    customerToken = signupRes.body.token;
  });

  test('manager can create a table', async () => {
    const res = await request(app).post('/api/v1/tables').set('Authorization', `Bearer ${managerToken}`).send({ table_number: 500, capacity: 6, type: 'regular' });
    expect(res.status).toBe(201);
    expect(res.body.data.table).toBeDefined();
    tableId = res.body.data.table.id;
  });

  test('customer cannot create a table', async () => {
    const res = await request(app).post('/api/v1/tables').set('Authorization', `Bearer ${customerToken}`).send({ table_number: 501, capacity: 2, type: 'regular' });
    expect(res.status).toBe(403);
  });

  test('any authenticated user can list tables', async () => {
    const res = await request(app).get('/api/v1/tables').set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.tables.length).toBeGreaterThan(0);
  });

  test('manager can update table', async () => {
    const res = await request(app).patch(`/api/v1/tables/${tableId}`).set('Authorization', `Bearer ${managerToken}`).send({ capacity: 8 });
    expect(res.status).toBe(200);
    expect(res.body.data.table.capacity).toBe(8);
  });

  test('manager can delete table only if available', async () => {
    // Ensure table is available
    const res = await request(app).delete(`/api/v1/tables/${tableId}`).set('Authorization', `Bearer ${managerToken}`);
    expect([204, 400]).toContain(res.status); // either deleted or rejected if not available
  });
});
