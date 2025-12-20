import request from 'supertest';
import app from '../app';
import { clearTestData, seedTables } from '../test-utils/db-utils';
import { createUserAndGetToken } from '../test-utils/auth-utils';

const runIntegration = process.env.RUN_INTEGRATION === 'true' || process.env.CI === 'true';
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Reservation integration tests', () => {
  let customerToken: string;
  let customerId: number;
  let tableId: number;

  beforeAll(async () => {
    const { setupDatabase } = await import('../test-utils/setup-db');
    await setupDatabase();
    // leave DB setup to beforeEach for test isolation
  });

  afterAll(async () => {
    await clearTestData();
    const { closePool } = await import('../test-utils/db-utils');
    await closePool();
  });

  // Ensure each test runs with a fresh DB state
  beforeEach(async () => {
    await clearTestData();
    const table = await seedTables();
    tableId = table.id;

    const { token, user } = await createUserAndGetToken({ name: `ResCust${Date.now()}`, email: `rescust+${Date.now()}@test.com`, password: 'password' });
    customerToken = token;
    customerId = user.id;
  });

  test('customer can create a reservation', async () => {
    const reservationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const res = await request(app).post('/api/v1/reservations').set('Authorization', `Bearer ${customerToken}`).send({ user_id: customerId, table_id: tableId, reservation_time: reservationTime, party_size: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.reservation).toBeDefined();
  });

  test('customer cannot create reservation for another user', async () => {
    // create a different user
    const { user: otherUser } = await createUserAndGetToken({ name: `Other${Date.now()}`, email: `other+${Date.now()}@test.com`, password: 'password' });

    const reservationTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    const res = await request(app).post('/api/v1/reservations').set('Authorization', `Bearer ${customerToken}`).send({ user_id: otherUser.id, table_id: tableId, reservation_time: reservationTime, party_size: 2 });
    expect(res.status).toBe(403);
  });

  test('cannot double book same table/time', async () => {
    const reservationTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    // first reservation
    const r1 = await request(app).post('/api/v1/reservations').set('Authorization', `Bearer ${customerToken}`).send({ user_id: customerId, table_id: tableId, reservation_time: reservationTime, party_size: 2 });
    expect(r1.status).toBe(201);

    // second reservation at same time should fail
    const r2 = await request(app).post('/api/v1/reservations').set('Authorization', `Bearer ${customerToken}`).send({ user_id: customerId, table_id: tableId, reservation_time: reservationTime, party_size: 2 });
    expect(r2.status).toBe(400);
  });
});
