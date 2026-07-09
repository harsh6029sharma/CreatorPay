import { Prisma } from "../../generated/prisma/client";
import { DealStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import type {
  CreateBrandDealInput,
  UpdateBrandDealInput,
  ListDealsQuery,
} from "../validators/brandDeal.validator";
import { scheduleReminderJob } from "../queues/payment.queue";

// Handles top-level dealValue always, and payments[].amount when payments are included
function serializeDeal<T extends { dealValue: Prisma.Decimal, payments?: { amount: Prisma.Decimal; [key: string]: any }[] }>(deal: T) {
  return {
    ...deal,
    dealValue: deal.dealValue.toNumber(),
    ...(deal.payments && {
      payments: deal.payments.map((p) => ({
        ...p,
        amount: p.amount.toNumber(),
      })),
    }),
  };
}

// create deal
export async function createDeal(userId: string, data: CreateBrandDealInput) {
  const deal = await prisma.brandDeal.create({
    data: {
      ...data,
      userId,
    },
  });

  return serializeDeal(deal);
}

// get single deal (with payments, if any exist)
export async function getDealById(userId: string, dealId: string) {
  const deal = await prisma.brandDeal.findFirst({
    where: { id: dealId, userId, deletedAt: null },
    include: { payment: true },
  });

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  return serializeDeal(deal);
}

// list deals (paginated and filtered)
export async function listDeals(userId: string, filters: ListDealsQuery) {
  const { status, page, limit, sortBy, sortOrder } = filters;

  const where: Prisma.BrandDealWhereInput = {
    userId,
    deletedAt: null,
    ...(status ? { status: status as DealStatus } : {}),
  };

  const [deals, total] = await Promise.all([
    prisma.brandDeal.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brandDeal.count({ where }),
  ]);

  return {
    deals: deals.map(serializeDeal),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Update deal fields
export async function updateDeal(
  userId: string,
  dealId: string,
  data: UpdateBrandDealInput
) {
  // Existence + ownership checking
  await getDealById(userId, dealId);

  const result = await prisma.brandDeal.updateMany({
    where: { id: dealId, userId, deletedAt: null },
    data,
  });

  if (result.count === 0) {
    throw new ApiError(404, "Deal not found");
  }

  const updated = await prisma.brandDeal.findUnique({ where: { id: dealId } });
  return serializeDeal(updated!);
}

// One-click status update — auto-creates Payment when status becomes CONFIRMED
export async function updateDealStatus(
  userId: string,
  dealId: string,
  status: DealStatus
) {
  await getDealById(userId, dealId);

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.brandDeal.updateMany({
      where: { id: dealId, userId, deletedAt: null },
      data: { status },
    });

    if (result.count === 0) {
      throw new ApiError(404, "Deal not found");
    }

    if (status === "CONFIRMED") {
      const existingPayment = await tx.payment.findFirst({
        where: { brandDealId: dealId },
      });

      if (!existingPayment) {
        const deal = await tx.brandDeal.findUniqueOrThrow({
          where: { id: dealId },
        });

        await tx.payment.create({
          data: {
            amount: deal.dealValue,
            dueDate: deal.deadline,
            brandDealId: deal.id,
          },
        });
      }
    }

    return tx.brandDeal.findUniqueOrThrow({
      where: { id: dealId },
      include: { payment: true },
    });
  });

  // Transaction commit ho chuka — ab job schedule karo (Redis op, DB tx ka part nahi)
  const newlyCreatedPayment = updated.payment.find(
    (p) => p.status === "PENDING"
  );
  if (status === "CONFIRMED" && newlyCreatedPayment) {
    const jobId = await scheduleReminderJob(
      newlyCreatedPayment.id,
      newlyCreatedPayment.dueDate
    );

    await prisma.payment.update({
      where: { id: newlyCreatedPayment.id },
      data: { reminderJobId: jobId },
    });
  }

  return serializeDeal(updated);
}

// Soft delete
export async function deleteDeal(userId: string, dealId: string) {
  const result = await prisma.brandDeal.updateMany({
    where: { id: dealId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Deal not found");
  }

  return { id: dealId };
}