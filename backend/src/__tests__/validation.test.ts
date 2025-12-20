import request from 'supertest';
import app from '../app';

describe('Validation checks', () => {
  test('POST /api/v1/queue without body should return 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/queue').send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/v1/auth/signup missing fields should return 400', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({ email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
