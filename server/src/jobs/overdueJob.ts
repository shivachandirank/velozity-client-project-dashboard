import cron from 'node-cron';
import { taskRepository } from '../repositories/task.repository';

export function initOverdueTaskJob() {
  // Run cron every 30 minutes (or '0 * * * *' for hourly)
  const task = cron.schedule('0 * * * *', async () => {
    try {
      console.log('⏰ Running scheduled job: checking overdue tasks...');
      const result = await taskRepository.markOverdueTasks();
      if (result.count > 0) {
        console.log(`✅ Overdue job completed: ${result.count} tasks marked as overdue.`);
      }
    } catch (error) {
      console.error('❌ Overdue job error:', error);
    }
  });

  console.log('🚀 Overdue task background job initialized (cron schedule: "0 * * * *")');
  return task;
}

export async function runOverdueCheckNow() {
  return taskRepository.markOverdueTasks();
}
