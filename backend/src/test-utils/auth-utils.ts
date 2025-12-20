import request from 'supertest';
import app from '../app';

export async function createUserAndGetToken(user: { name: string; email: string; password: string; role?: string }) {
  const res = await request(app).post('/api/v1/auth/signup').send(user);
  if (res.status !== 201) {
    throw new Error(`Failed to create user: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, user: res.body.data.user };
}
