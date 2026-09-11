import { Role, TaskStatus, Priority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../repositories/prisma';

export async function seedDatabase() {
  console.log('🌱 Executing database seed...');

  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: { name: 'Alex Admin', email: 'admin@velozity.demo', passwordHash, role: Role.ADMIN },
  });

  const pm1 = await prisma.user.create({
    data: { name: 'Paula PM One', email: 'pm1@velozity.demo', passwordHash, role: Role.PROJECT_MANAGER },
  });

  const pm2 = await prisma.user.create({
    data: { name: 'Peter PM Two', email: 'pm2@velozity.demo', passwordHash, role: Role.PROJECT_MANAGER },
  });

  const dev1 = await prisma.user.create({
    data: { name: 'Ravi Developer 1', email: 'dev1@velozity.demo', passwordHash, role: Role.DEVELOPER },
  });

  const dev2 = await prisma.user.create({
    data: { name: 'Diana Developer 2', email: 'dev2@velozity.demo', passwordHash, role: Role.DEVELOPER },
  });

  const dev3 = await prisma.user.create({
    data: { name: 'David Developer 3', email: 'dev3@velozity.demo', passwordHash, role: Role.DEVELOPER },
  });

  const dev4 = await prisma.user.create({
    data: { name: 'Dana Developer 4', email: 'dev4@velozity.demo', passwordHash, role: Role.DEVELOPER },
  });

  const client1 = await prisma.client.create({
    data: { name: 'Acme Corporation', email: 'contact@acme.com', company: 'Acme Inc.' },
  });

  const client2 = await prisma.client.create({
    data: { name: 'Stark Industries', email: 'info@stark.com', company: 'Stark Tech' },
  });

  const client3 = await prisma.client.create({
    data: { name: 'Cyberdyne Systems', email: 'support@cyberdyne.com', company: 'Cyberdyne Global' },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of modern customer portal and landing pages with Tailwind and Next.js.',
      clientId: client1.id,
      ownerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Cross-platform iOS and Android mobile application for real-time order tracking.',
      clientId: client2.id,
      ownerId: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Enterprise ERP System',
      description: 'Migration of legacy database architecture to high-availability cloud PostgreSQL microservices.',
      clientId: client3.id,
      ownerId: pm2.id,
    },
  });

  const pastDate1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const pastDate2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const t1 = await prisma.task.create({
    data: { title: 'Design Wireframes & UI Kit', description: 'Create Figma design tokens', projectId: project1.id, assignedDeveloperId: dev1.id, status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: pastDate1 },
  });

  const t2 = await prisma.task.create({
    data: { title: 'Implement Navigation & Sidebar', description: 'Build responsive sidebar', projectId: project1.id, assignedDeveloperId: dev1.id, status: TaskStatus.IN_REVIEW, priority: Priority.HIGH, dueDate: futureDate1 },
  });

  const t3 = await prisma.task.create({
    data: { title: 'Integrate Stripe Payment Gateway', description: 'Set up checkout webhooks', projectId: project1.id, assignedDeveloperId: dev2.id, status: TaskStatus.IN_PROGRESS, priority: Priority.CRITICAL, dueDate: pastDate2, isOverdue: true },
  });

  const t4 = await prisma.task.create({
    data: { title: 'Optimize SEO & OpenGraph Meta Tags', description: 'Semantic markup', projectId: project1.id, assignedDeveloperId: dev2.id, status: TaskStatus.TODO, priority: Priority.LOW, dueDate: futureDate2 },
  });

  const t5 = await prisma.task.create({
    data: { title: 'E2E Testing & Lighthouse Audit', description: 'Playwright testing', projectId: project1.id, assignedDeveloperId: dev1.id, status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: futureDate3 },
  });

  const t6 = await prisma.task.create({
    data: { title: 'Set up Push Notification Service', description: 'FCM integration', projectId: project2.id, assignedDeveloperId: dev3.id, status: TaskStatus.IN_PROGRESS, priority: Priority.CRITICAL, dueDate: pastDate1, isOverdue: true },
  });

  const t7 = await prisma.task.create({
    data: { title: 'Implement Offline Storage Cache', description: 'WatermelonDB cache', projectId: project2.id, assignedDeveloperId: dev3.id, status: TaskStatus.TODO, priority: Priority.HIGH, dueDate: futureDate1 },
  });

  const t8 = await prisma.task.create({
    data: { title: 'Build Live Location Tracking Map', description: 'Mapbox SDK integration', projectId: project2.id, assignedDeveloperId: dev1.id, status: TaskStatus.IN_REVIEW, priority: Priority.HIGH, dueDate: futureDate2 },
  });

  const t9 = await prisma.task.create({
    data: { title: 'User Profile & Settings Screen', description: 'Biometric settings', projectId: project2.id, assignedDeveloperId: dev2.id, status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: pastDate2 },
  });

  const t10 = await prisma.task.create({
    data: { title: 'App Store Submission Package', description: 'Prepare store screenshots', projectId: project2.id, assignedDeveloperId: dev3.id, status: TaskStatus.TODO, priority: Priority.LOW, dueDate: futureDate3 },
  });

  const t11 = await prisma.task.create({
    data: { title: 'Migrate PostgreSQL Database Schemas', description: 'Zero-downtime partitioning', projectId: project3.id, assignedDeveloperId: dev4.id, status: TaskStatus.IN_PROGRESS, priority: Priority.CRITICAL, dueDate: futureDate1 },
  });

  const t12 = await prisma.task.create({
    data: { title: 'Implement OAuth2 / SAML Single Sign-On', description: 'Azure AD / Okta identity', projectId: project3.id, assignedDeveloperId: dev4.id, status: TaskStatus.IN_REVIEW, priority: Priority.HIGH, dueDate: futureDate2 },
  });

  const t13 = await prisma.task.create({
    data: { title: 'Audit Log & Compliance Exports', description: 'SOC2 audit trail export', projectId: project3.id, assignedDeveloperId: dev4.id, status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: pastDate1, isOverdue: true },
  });

  const t14 = await prisma.task.create({
    data: { title: 'Automated Database Backup Pipeline', description: 'Encrypted pg_dump snapshots', projectId: project3.id, assignedDeveloperId: dev4.id, status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: pastDate2 },
  });

  const t15 = await prisma.task.create({
    data: { title: 'API Rate Limiting & Redis Throttling', description: 'Token bucket rate limiter', projectId: project3.id, assignedDeveloperId: dev4.id, status: TaskStatus.TODO, priority: Priority.LOW, dueDate: futureDate3 },
  });

  await prisma.activityLog.createMany({
    data: [
      { projectId: project1.id, taskId: t2.id, userId: dev1.id, action: 'STATUS_UPDATE', previousStatus: TaskStatus.IN_PROGRESS, newStatus: TaskStatus.IN_REVIEW, description: 'Ravi Developer 1 moved Task "Implement Navigation & Sidebar" from In Progress → In Review' },
      { projectId: project1.id, taskId: t1.id, userId: dev1.id, action: 'STATUS_UPDATE', previousStatus: TaskStatus.IN_REVIEW, newStatus: TaskStatus.DONE, description: 'Ravi Developer 1 moved Task "Design Wireframes & UI Kit" from In Review → Done' },
      { projectId: project2.id, taskId: t8.id, userId: dev1.id, action: 'STATUS_UPDATE', previousStatus: TaskStatus.IN_PROGRESS, newStatus: TaskStatus.IN_REVIEW, description: 'Ravi Developer 1 moved Task "Build Live Location Tracking Map" from In Progress → In Review' },
      { projectId: project3.id, taskId: t12.id, userId: dev4.id, action: 'STATUS_UPDATE', previousStatus: TaskStatus.IN_PROGRESS, newStatus: TaskStatus.IN_REVIEW, description: 'Dana Developer 4 moved Task "Implement OAuth2 / SAML Single Sign-On" from In Progress → In Review' },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { recipientId: dev1.id, actorId: pm1.id, taskId: t2.id, projectId: project1.id, type: NotificationType.TASK_ASSIGNED, message: 'You were assigned Task "Implement Navigation & Sidebar" in Website Redesign.', isRead: false },
      { recipientId: pm1.id, actorId: dev1.id, taskId: t2.id, projectId: project1.id, type: NotificationType.TASK_IN_REVIEW, message: 'Ravi Developer 1 moved Task "Implement Navigation & Sidebar" to In Review.', isRead: false },
      { recipientId: pm2.id, actorId: dev4.id, taskId: t12.id, projectId: project3.id, type: NotificationType.TASK_IN_REVIEW, message: 'Dana Developer 4 moved Task "Implement OAuth2 / SAML Single Sign-On" to In Review.', isRead: false },
      { recipientId: dev4.id, actorId: pm2.id, taskId: t11.id, projectId: project3.id, type: NotificationType.TASK_ASSIGNED, message: 'You were assigned Task "Migrate PostgreSQL Database Schemas" in Enterprise ERP System.', isRead: true, readAt: new Date() },
    ],
  });

  console.log('✅ Database seed completed successfully.');
}
