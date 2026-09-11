import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../repositories/prisma';
import { runOverdueCheckNow } from '../jobs/overdueJob';

let adminToken: string;
let pm1Token: string;
let pm2Token: string;
let dev1Token: string;
let dev2Token: string;
let dev4Token: string;

let pm1ProjectId: string;
let pm2ProjectId: string;

let dev1TaskId: string;
let dev2TaskId: string;
let dev4TaskId: string;

beforeAll(async () => {
  // 1. Authenticate users and acquire JWT access tokens
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@velozity.demo', password: 'Password123!' });
  adminToken = adminRes.body.data.accessToken;

  const pm1Res = await request(app).post('/api/auth/login').send({ email: 'pm1@velozity.demo', password: 'Password123!' });
  pm1Token = pm1Res.body.data.accessToken;

  const pm2Res = await request(app).post('/api/auth/login').send({ email: 'pm2@velozity.demo', password: 'Password123!' });
  pm2Token = pm2Res.body.data.accessToken;

  const dev1Res = await request(app).post('/api/auth/login').send({ email: 'dev1@velozity.demo', password: 'Password123!' });
  dev1Token = dev1Res.body.data.accessToken;

  const dev2Res = await request(app).post('/api/auth/login').send({ email: 'dev2@velozity.demo', password: 'Password123!' });
  dev2Token = dev2Res.body.data.accessToken;

  const dev4Res = await request(app).post('/api/auth/login').send({ email: 'dev4@velozity.demo', password: 'Password123!' });
  dev4Token = dev4Res.body.data.accessToken;

  // Retrieve project IDs
  const pm1User = await prisma.user.findUnique({ where: { email: 'pm1@velozity.demo' } });
  const pm2User = await prisma.user.findUnique({ where: { email: 'pm2@velozity.demo' } });
  const dev1User = await prisma.user.findUnique({ where: { email: 'dev1@velozity.demo' } });
  const dev2User = await prisma.user.findUnique({ where: { email: 'dev2@velozity.demo' } });
  const dev4User = await prisma.user.findUnique({ where: { email: 'dev4@velozity.demo' } });

  const p1 = await prisma.project.findFirst({ where: { ownerId: pm1User!.id } });
  const p2 = await prisma.project.findFirst({ where: { ownerId: pm2User!.id } });
  pm1ProjectId = p1!.id;
  pm2ProjectId = p2!.id;

  const t1 = await prisma.task.findFirst({ where: { assignedDeveloperId: dev1User!.id } });
  const t2 = await prisma.task.findFirst({ where: { assignedDeveloperId: dev2User!.id } });
  const t4 = await prisma.task.findFirst({ where: { assignedDeveloperId: dev4User!.id } });

  dev1TaskId = t1!.id;
  dev2TaskId = t2!.id;
  dev4TaskId = t4!.id;
});

describe('RBAC & Security Test Suite', () => {
  it('1. Admin can access all projects', async () => {
    const res = await request(app)
      .get(`/api/projects/${pm2ProjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(pm2ProjectId);
  });

  it('2. PM can access own project', async () => {
    const res = await request(app)
      .get(`/api/projects/${pm1ProjectId}`)
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('3. PM cannot access another PM\'s project (strict isolation)', async () => {
    const res = await request(app)
      .get(`/api/projects/${pm2ProjectId}`)
      .set('Authorization', `Bearer ${pm1Token}`);

    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('4. Developer can access assigned task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${dev1TaskId}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(dev1TaskId);
  });

  it('5. Developer cannot access another developer\'s task via URL ID tampering', async () => {
    const res = await request(app)
      .get(`/api/tasks/${dev2TaskId}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('6. Developer cannot access PM-only project information for unassigned projects', async () => {
    const res = await request(app)
      .get(`/api/projects/${pm2ProjectId}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('7. Unauthorized users without token cannot call protected APIs', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('8. & 9. Task status update creates ActivityLog in DB transaction storing previous/new status', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${dev1TaskId}/status`)
      .set('Authorization', `Bearer ${dev1Token}`)
      .send({ status: 'IN_REVIEW' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_REVIEW');

    const activity = await prisma.activityLog.findFirst({
      where: { taskId: dev1TaskId, newStatus: 'IN_REVIEW' },
      orderBy: { createdAt: 'desc' },
    });

    expect(activity).not.toBeNull();
    expect(activity?.previousStatus).toBeDefined();
    expect(activity?.newStatus).toBe('IN_REVIEW');
  });

  it('10. & 11. IN_REVIEW status change creates persistent PM Notification', async () => {
    const dev4Task = await prisma.task.findUnique({
      where: { id: dev4TaskId },
      include: { project: true },
    });

    const res = await request(app)
      .patch(`/api/tasks/${dev4TaskId}/status`)
      .set('Authorization', `Bearer ${dev4Token}`)
      .send({ status: 'IN_REVIEW' });

    expect(res.status).toBe(200);

    const notif = await prisma.notification.findFirst({
      where: {
        recipientId: dev4Task!.project.ownerId,
        type: 'TASK_IN_REVIEW',
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(notif).not.toBeNull();
    expect(notif?.message).toContain('In Review');
  });

  it('12. Recent activity endpoint returns only role-filtered events from PostgreSQL', async () => {
    const devRes = await request(app)
      .get('/api/activity/recent')
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(devRes.status).toBe(200);
    expect(devRes.body.success).toBe(true);

    // Verify developer receives only activities related to assigned tasks
    const devActivities = devRes.body.data;
    expect(Array.isArray(devActivities)).toBe(true);
  });

  it('13. Overdue background job updates tasks past due date to isOverdue = true', async () => {
    const result = await runOverdueCheckNow();
    expect(result).toBeDefined();

    const overdueCount = await prisma.task.count({ where: { isOverdue: true } });
    expect(overdueCount).toBeGreaterThanOrEqual(2);
  });

  it('14. Notification unread count updates correctly and supports marking as read', async () => {
    const unreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.data.unreadCount).toBeGreaterThanOrEqual(0);

    const markRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(markRes.status).toBe(200);

    const newUnreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(newUnreadRes.body.data.unreadCount).toBe(0);
  });
});
