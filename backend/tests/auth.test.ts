import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth & User API Integration Tests', () => {
  const testEmail = `test.user.${Date.now()}@example.in`;
  const testPassword = 'securePassword123';
  let authToken: string;

  it('should register a new customer successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Rahul Dravid',
        phone: '+91 9988776655',
        city: 'Bengaluru',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Duplicate User',
        phone: '+91 9988776655',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should log in successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current authenticated user profile with /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.wallet.availableBalance).toBeDefined();
  });

  it('should reject unauthenticated request to /auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
