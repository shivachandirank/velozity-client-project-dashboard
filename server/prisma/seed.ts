import { PrismaClient, Role, TaskStatus, Priority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset existing records for idempotent seeding
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Users setup
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@velozity.demo',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Paula PM One',
      email: 'pm1@velozity.demo',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Peter PM Two',
      email: 'pm2@velozity.demo',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Ravi Developer 1',
      email: 'dev1@velozity.demo',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Diana Developer 2',
      email: 'dev2@velozity.demo',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'David Developer 3',
      email: 'dev3@velozity.demo',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Dana Developer 4',
      email: 'dev4@velozity.demo',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  // Clients setup
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      company: 'Acme Inc.',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Stark Industries',
      email: 'info@stark.com',
      company: 'Stark Tech',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Cyberdyne Systems',
      email: 'support@cyberdyne.com',
      company: 'Cyberdyne Global',
    },
  });

  // Projects setup
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

  // Relative dates for overdue testing
  const pastDate1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const pastDate2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Project 1 Tasks
  const t1 = await prisma.task.create({
    data: {
      title: 'Design Wireframes & UI Kit',
      description: 'Create Figma design tokens and component mockups for dark mode landing page.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: pastDate1,
      isOverdue: false,
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: 'Implement Navigation & Sidebar',
      description: 'Build responsive sidebar and header navigation components with active state indicator.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: 'Integrate Stripe Payment Gateway',
      description: 'Set up checkout webhooks and recurring subscription payment handlers.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: pastDate2,
      isOverdue: true,
    },
  });

  const t4 = await prisma.task.create({
    data: {
      title: 'Optimize SEO & OpenGraph Meta Tags',
      description: 'Ensure semantic HTML5 markup, dynamic meta descriptions, and sitemap generation.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const t5 = await prisma.task.create({
    data: {
      title: 'E2E Testing & Lighthouse Audit',
      description: 'Run automated Playwright visual testing and achieve 95+ performance scores.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Project 2 Tasks
  const t6 = await prisma.task.create({
    data: {
      title: 'Set up Push Notification Service',
      description: 'Configure Firebase Cloud Messaging tokens and background payload handlers.',
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: pastDate1,
      isOverdue: true,
    },
  });

  const t7 = await prisma.task.create({
    data: {
      title: 'Implement Offline Storage Cache',
      description: 'Use WatermelonDB to cache offline user state and handle background sync queues.',
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const t8 = await prisma.task.create({
    data: {
      title: 'Build Live Location Tracking Map',
      description: 'Integrate Mapbox SDK with WebSocket position updates for delivery drivers.',
      projectId: project2.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const t9 = await prisma.task.create({
    data: {
      title: 'User Profile & Settings Screen',
      description: 'Build profile picture upload, biometric auth settings, and password change modal.',
      projectId: project2.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: pastDate2,
      isOverdue: false,
    },
  });

  const t10 = await prisma.task.create({
    data: {
      title: 'App Store Submission Package',
      description: 'Prepare privacy nutrition labels, store screenshots, and TestFlight build target.',
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Project 3 Tasks
  const t11 = await prisma.task.create({
    data: {
      title: 'Migrate PostgreSQL Database Schemas',
      description: 'Execute zero-downtime database table partitioning and index optimizations.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const t12 = await prisma.task.create({
    data: {
      title: 'Implement OAuth2 / SAML Single Sign-On',
      description: 'Configure Azure AD and Okta enterprise identity providers.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const t13 = await prisma.task.create({
    data: {
      title: 'Audit Log & Compliance Exports',
      description: 'Generate SOC2 compliant audit trail export endpoints in CSV and JSON formats.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: pastDate1,
      isOverdue: true,
    },
  });

  const t14 = await prisma.task.create({
    data: {
      title: 'Automated Database Backup Pipeline',
      description: 'Set up daily encrypted pg_dump snapshots to AWS S3 Glacier storage.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: pastDate2,
      isOverdue: false,
    },
  });

  const t15 = await prisma.task.create({
    data: {
      title: 'API Rate Limiting & Redis Throttling',
      description: 'Add token bucket rate limiter middleware to prevent DDoS attacks on public endpoints.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Activity log seed data
  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: t2.id,
        userId: dev1.id,
        action: 'STATUS_UPDATE',
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        description: 'Ravi Developer 1 moved Task "Implement Navigation & Sidebar" from In Progress → In Review',
      },
      {
        projectId: project1.id,
        taskId: t1.id,
        userId: dev1.id,
        action: 'STATUS_UPDATE',
        previousStatus: TaskStatus.IN_REVIEW,
        newStatus: TaskStatus.DONE,
        description: 'Ravi Developer 1 moved Task "Design Wireframes & UI Kit" from In Review → Done',
      },
      {
        projectId: project2.id,
        taskId: t8.id,
        userId: dev1.id,
        action: 'STATUS_UPDATE',
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        description: 'Ravi Developer 1 moved Task "Build Live Location Tracking Map" from In Progress → In Review',
      },
      {
        projectId: project3.id,
        taskId: t12.id,
        userId: dev4.id,
        action: 'STATUS_UPDATE',
        previousStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        description: 'Dana Developer 4 moved Task "Implement OAuth2 / SAML Single Sign-On" from In Progress → In Review',
      },
    ],
  });

  // Notifications seed data
  await prisma.notification.createMany({
    data: [
      {
        recipientId: dev1.id,
        actorId: pm1.id,
        taskId: t2.id,
        projectId: project1.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You were assigned Task "Implement Navigation & Sidebar" in Website Redesign.',
        isRead: false,
      },
      {
        recipientId: pm1.id,
        actorId: dev1.id,
        taskId: t2.id,
        projectId: project1.id,
        type: NotificationType.TASK_IN_REVIEW,
        message: 'Ravi Developer 1 moved Task "Implement Navigation & Sidebar" to In Review.',
        isRead: false,
      },
      {
        recipientId: pm2.id,
        actorId: dev4.id,
        taskId: t12.id,
        projectId: project3.id,
        type: NotificationType.TASK_IN_REVIEW,
        message: 'Dana Developer 4 moved Task "Implement OAuth2 / SAML Single Sign-On" to In Review.',
        isRead: false,
      },
      {
        recipientId: dev4.id,
        actorId: pm2.id,
        taskId: t11.id,
        projectId: project3.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You were assigned Task "Migrate PostgreSQL Database Schemas" in Enterprise ERP System.',
        isRead: true,
        readAt: new Date(),
      },
    ],
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
