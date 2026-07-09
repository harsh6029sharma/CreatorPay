import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { PaymentStatus, NotificationType } from "../../generated/prisma/enums";

export const paymentReminderWorker = new Worker(
  "payment-reminders",
  async (job: Job) => {
    const { paymentId } = job.data as { paymentId: string };

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { brandDeal: true },
    });

    if (!payment) {
      // Payment delete ho chuka hai — silently skip
      return;
    }

    // Agar already paid ya reminder ja chuka hai, skip (idempotency safety)
    if (payment.status !== PaymentStatus.PENDING) {
      return;
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REMINDED },
      }),
      prisma.notification.create({
        data: {
          userId: payment.brandDeal.userId,
          type: NotificationType.PAYMENT_REMINDER,
          message: `Payment of ₹${payment.amount.toString()} for "${payment.brandDeal.brandName}" is due soon.`,
          brandDealId: payment.brandDealId,
          paymentId: payment.id,
        },
      }),
    ]);
  },
  { connection: redisConnection }
);

paymentReminderWorker.on("failed", (job, err) => {
  console.error(`Reminder job ${job?.id} failed:`, err.message);
});