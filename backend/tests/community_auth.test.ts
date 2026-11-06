import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Community Authorization & Self-Approval Prevention Tests (Task 07)', () => {
  let meeraAdminToken: string;
  let suspendedAdminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    // 1. Log in as Meera Nair (Authorized Committee Member for Greenwood Palms)
    const meeraRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'meera.nair@example.in',
        password: 'password123',
      });
    meeraAdminToken = meeraRes.body.data.token;

    // 2. Log in as Suresh Suspended (Suspended Committee Member)
    const suspRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'suspended.admin@example.in',
        password: 'password123',
      });
    suspendedAdminToken = suspRes.body.data.token;

    // 3. Log in as Aditya Sharma (Regular Customer)
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aditya.sharma@example.in',
        password: 'password123',
      });
    customerToken = custRes.body.data.token;
  });

  it('should reject unprivileged customer trying to access community approvals (403)', async () => {
    const res = await request(app)
      .get('/api/v1/communities/comm_greenwood_blr/approvals')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow authorized committee member to fetch pending approvals for their community', async () => {
    const res = await request(app)
      .get('/api/v1/communities/comm_greenwood_blr/approvals')
      .set('Authorization', `Bearer ${meeraAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should reject committee member accessing a different community they do not belong to (403)', async () => {
    const res = await request(app)
      .get('/api/v1/communities/comm_palm_meadows_whitefield/approvals')
      .set('Authorization', `Bearer ${meeraAdminToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not an authorized administrator');
  });

  it('should strictly prohibit self-approval of parking listings owned by the administrator (403)', async () => {
    // appr_self_meera is for space_meera_self, owned by adm_meera_01
    const res = await request(app)
      .post('/api/v1/communities/approvals/appr_self_meera/process')
      .set('Authorization', `Bearer ${meeraAdminToken}`)
      .send({
        status: 'APPROVED',
        reason: 'Self approval attempt by listing owner',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Self-approval is strictly prohibited');
  });

  it('should reject approval actions from suspended or revoked committee members (403)', async () => {
    const res = await request(app)
      .post('/api/v1/communities/approvals/appr_02/process')
      .set('Authorization', `Bearer ${suspendedAdminToken}`)
      .send({
        status: 'APPROVED',
        reason: 'Attempt by suspended admin',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Revoked or suspended committee membership');
  });

  it('should allow authorized administrator to approve a third-party residential listing', async () => {
    // appr_02 is for space_05_pending, owned by usr_aditya_01
    const res = await request(app)
      .post('/api/v1/communities/approvals/appr_02/process')
      .set('Authorization', `Bearer ${meeraAdminToken}`)
      .send({
        status: 'APPROVED',
        reason: 'Verified residency document and parking deed.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');

    // Verify listing is now marked approved and available
    const spaceRes = await request(app).get('/api/v1/parking/space_05_pending');
    expect(spaceRes.status).toBe(200);
    expect(spaceRes.body.data.approvalStatus).toBe('APPROVED');
    expect(spaceRes.body.data.isAvailable).toBe(true);
  });
});
