import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth & Role Security Hardening Tests (Task 07)', () => {
  const customerEmail = `sec.cust.${Date.now()}@example.in`;
  const password = 'StrongPassword123!';
  let customerToken: string;
  let customerId: string;

  it('should ignore privileged role parameters in public registration and enforce CUSTOMER only', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: customerEmail,
        password,
        name: 'Normal Customer',
        phone: '+91 9900112233',
        // Attempting to escalate privilege via public registration payload
        role: 'COMMUNITY_ADMIN',
        roles: ['COMMUNITY_ADMIN', 'SECURITY_STAFF'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    customerToken = res.body.data.token;
    customerId = res.body.data.user.id;
    expect(res.body.data.user.activeRole).toBe('CUSTOMER');
    expect(res.body.data.user.eligibleRoles).toEqual(['CUSTOMER']);
  });

  it('should reject switching to an ineligible role (COMMUNITY_ADMIN)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/switch-role')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ role: 'COMMUNITY_ADMIN' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not authorized');
  });

  it('should reject switching to an ineligible role (SECURITY)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/switch-role')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ role: 'SECURITY' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not authorized');
  });

  it('should allow switching to an eligible role when user possesses that role', async () => {
    // Aditya Sharma is seeded with ['CUSTOMER', 'OWNER', 'SECURITY', 'COMMUNITY_ADMIN']
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aditya.sharma@example.in',
        password: 'password123',
      });

    const adityaToken = loginRes.body.data.token;
    expect(loginRes.body.data.user.eligibleRoles).toContain('OWNER');

    const switchRes = await request(app)
      .post('/api/v1/auth/switch-role')
      .set('Authorization', `Bearer ${adityaToken}`)
      .send({ role: 'OWNER' });

    expect(switchRes.status).toBe(200);
    expect(switchRes.body.success).toBe(true);
    expect(switchRes.body.data.user.activeRole).toBe('OWNER');
    expect(switchRes.body.data.token).toBeDefined();

    // Verify switched token works and reflects OWNER
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${switchRes.body.data.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.activeRole).toBe('OWNER');
  });

  it('should reject requests with invalid or tampered JWT signatures', async () => {
    const tamperedToken = customerToken + 'tampered';
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject requests with completely bogus or expired JWT tokens', async () => {
    const expiredToken = jwt.sign(
      { sub: customerId, email: customerEmail, role: 'CUSTOMER' },
      'wrong-secret-key-that-does-not-match',
      { expiresIn: '-10s' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
