import { Prisma } from "../../generated/prisma/client";
import { DealStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import type {
  CreateBrandDealInput,
  UpdateBrandDealInput,
  ListDealsQuery,
} from "../validators/brandDeal.validator";


// ---- Shared serializer: Decimal -> number, keeps response shape consistent ----
function serializeDeal<T extends { dealValue: Prisma.Decimal }>(deal: T) {
  return {
    ...deal,
    dealValue: deal.dealValue.toNumber(),
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

// get single deal (with payment, if it exists) 
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

//  Update deal fields 
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

//  One-click status update 
export async function updateDealStatus(
  userId: string,
  dealId: string,
  status: DealStatus
) {
  await getDealById(userId, dealId);

  const result = await prisma.brandDeal.updateMany({
    where: { id: dealId, userId, deletedAt: null },
    data: { status },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Deal not found");
  }

  // TODO: future hook — when status === "CONFIRMED", auto-create Payment record
  // (part of the Payment reminders phase, not built yet)

  const updated = await prisma.brandDeal.findUnique({ where: { id: dealId } });
  return serializeDeal(updated!);
}

// ---- Soft delete ----
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