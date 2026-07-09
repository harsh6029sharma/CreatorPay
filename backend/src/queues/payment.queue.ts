import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis";

export const paymentReminderQueue = new Queue("payment-reminders", {
  connection: redisConnection,
});

const REMINDER_DAYS_BEFORE = Number(process.env.REMINDER_DAYS_BEFORE ?? 3);

export async function scheduleReminderJob(paymentId: string, dueDate: Date) {
  const reminderTime = new Date(dueDate);
  reminderTime.setDate(reminderTime.getDate() - REMINDER_DAYS_BEFORE);

  const delay = Math.max(reminderTime.getTime() - Date.now(), 0);

  const job = await paymentReminderQueue.add(
    "send-reminder",
    { paymentId },
    {
      delay,
      jobId: `reminder-${paymentId}`,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return job.id;
}

export async function cancelReminderJob(paymentId: string) {
  const job = await paymentReminderQueue.getJob(`reminder-${paymentId}`);
  if (job) {
    await job.remove();
  }
}