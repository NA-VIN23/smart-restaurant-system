import request from 'supertest';
import app from '../app';
import { clearTestData, seedTables } from '../test-utils/db-utils';

const runIntegration = process.env.RUN_INTEGRATION === 'true' || process.env.CI === 'true';

const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Queue integration tests', () => {
  let customerToken: string;
  let managerToken: string;
  let customerId: number;
  let queueId: number;
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

  test('signup customer and login', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({ name: 'Cust', email: 'cust@test.com', password: 'password' });
    expect(signupRes.status).toBe(201);
    customerId = signupRes.body.data.user.id;
    customerToken = signupRes.body.token;
  });

  test('signup manager and login', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({ name: 'Mgr', email: 'mgr@test.com', password: 'password', role: 'manager' });
    expect(signupRes.status).toBe(201);
    managerToken = signupRes.body.token;
  });

  test('customer can join queue', async () => {
    const res = await request(app).post('/api/v1/queue').set('Authorization', `Bearer ${customerToken}`).send({ user_id: customerId, party_size: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.queue).toBeDefined();
    queueId = res.body.data.queue.id;
  });

  test('customer can get queue position', async () => {
    const res = await request(app).get(`/api/v1/queue/position/${customerId}`).set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.position).toBeGreaterThanOrEqual(1);
  });

  test('customer cannot view another user queue position', async () => {
    const { token: otherToken } = await (await import('../test-utils/auth-utils')).createUserAndGetToken({ name: `QOther${Date.now()}`, email: `qother+${Date.now()}@test.com`, password: 'password' });
    const res = await request(app).get(`/api/v1/queue/position/${customerId}`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  test('manager can create a table and seat customer', async () => {
    const tableRes = await request(app).post('/api/v1/tables').set('Authorization', `Bearer ${managerToken}`).send({ table_number: 200, capacity: 4, type: 'regular' });
    expect(tableRes.status).toBe(201);
    tableId = tableRes.body.data.table.id;

    const seatRes = await request(app).patch(`/api/v1/queue/${queueId}`).set('Authorization', `Bearer ${managerToken}`).send({ status: 'seated', tableId });
    expect(seatRes.status).toBe(200);
    expect(seatRes.body.data.queue.status).toBe('seated');
  });

  test('customer can leave queue (if in waiting)', async () => {
    // create a new entry and then leave
    const joinRes = await request(app).post('/api/v1/queue').set('Authorization', `Bearer ${customerToken}`).send({ user_id: customerId, party_size: 2 });
    expect(joinRes.status).toBe(201);
    const id = joinRes.body.data.queue.id;

    // attempt to remove with a different customer should be forbidden
    const { token: otherToken } = await (await import('../test-utils/auth-utils')).createUserAndGetToken({ name: `QOther${Date.now()}`, email: `qother2+${Date.now()}@test.com`, password: 'password' });

    const forbidden = await request(app).delete(`/api/v1/queue/${id}`).set('Authorization', `Bearer ${otherToken}`);
    expect(forbidden.status).toBe(403);

    // owner can remove
    const leaveRes = await request(app).delete(`/api/v1/queue/${id}`).set('Authorization', `Bearer ${customerToken}`);
    expect(leaveRes.status).toBe(204);
  });
});
