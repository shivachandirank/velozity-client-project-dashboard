import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initSocketServer } from './sockets/socketServer';
import { initOverdueTaskJob } from './jobs/overdueJob';

const server = http.createServer(app);

// Initialize WebSockets
initSocketServer(server);

// Initialize Background Cron Jobs
initOverdueTaskJob();

const PORT = parseInt(env.PORT, 10) || 5000;

server.listen(PORT, () => {
  console.log(`⚡ Velozity Backend Server running on port ${PORT} [${env.NODE_ENV}]`);
});
