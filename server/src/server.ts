import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initSocketServer } from './sockets/socketServer';
import { initOverdueTaskJob } from './jobs/overdueJob';

import { prisma } from './repositories/prisma';
import { seedDatabase } from './services/autoSeedService';

const server = http.createServer(app);

// Initialize WebSockets
initSocketServer(server);

// Initialize Background Cron Jobs
initOverdueTaskJob();

const PORT = parseInt(env.PORT, 10) || 5000;

server.listen(PORT, async () => {
  console.log(`⚡ Velozity Backend Server running on port ${PORT} [${env.NODE_ENV}]`);

  // Auto-seed database on boot if database has zero users
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 Empty database detected! Running automatic seed...');
      await seedDatabase();
      console.log('✅ Automatic seed complete!');
    }
  } catch (err) {
    console.log('🌱 Database boot check:', err instanceof Error ? err.message : err);
  }
});
