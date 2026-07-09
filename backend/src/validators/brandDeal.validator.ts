import * as z from "zod";

export const dealStatusEnum = z.enum([
  "PITCHED",
  "NEGOTIATING",
  "CONFIRMED",
  "PAID",
  "REJECTED",
]);

const dealIdParam = z.string().min(1, { error: "Invalid deal id" });

export const createBrandDealSchema = z.object({
  body: z.object({
    brandName: z
      .string({ error: "Brand name is required" })
      .min(1, { error: "Brand name is required" })
      .max(100),
    dealValue: z
      .number({ error: "Deal value must be a number" })
      .positive({ error: "Deal value must be greater than 0" }),
    currency: z.string().length(3).default("INR"),
    status: dealStatusEnum.default("PITCHED"),
    deadline: z.coerce.date({ error: "Deadline is required" }),
    contactEmail: z.email({ error: "Invalid email address" }).optional(),
    contactName: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const updateBrandDealSchema = z.object({
  params: z.object({
    id: dealIdParam,
  }),
  body: z
    .object({
      brandName: z.string().min(1).max(100).optional(),
      dealValue: z.number().positive().optional(),
      currency: z.string().length(3).optional(),
      deadline: z.coerce.date().optional(),
      contactEmail: z.email().optional(),
      contactName: z.string().max(100).optional(),
      notes: z.string().max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      error: "At least one field is required to update",
    }),
});

export const updateDealStatusSchema = z.object({
  params: z.object({
    id: dealIdParam,
  }),
  body: z.object({
    status: dealStatusEnum,
  }),
});

export const getDealByIdSchema = z.object({
  params: z.object({
    id: dealIdParam,
  }),
});

export const listDealsQuerySchema = z.object({
  query: z.object({
    status: dealStatusEnum.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["createdAt", "dealValue", "deadline"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateBrandDealInput = z.infer<typeof createBrandDealSchema>["body"];
export type UpdateBrandDealInput = z.infer<typeof updateBrandDealSchema>["body"];
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>["query"];