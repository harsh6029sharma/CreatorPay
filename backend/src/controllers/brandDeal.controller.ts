import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as brandDealService from "../services/brandDeal.service";
import type {
    CreateBrandDealInput,
    UpdateBrandDealInput,
    ListDealsQuery,
} from "../validators/brandDeal.validator";
import { DealStatus } from "../../generated/prisma/enums";

// creating deal
export const createDealController = asyncHandler<{}, any, CreateBrandDealInput>(
    async (req, res) => {
        const userId = req.user!.id;
        const data = req.body;

        const deal = await brandDealService.createDeal(userId, data);

        return res
            .status(201)
            .json(new ApiResponse(201, deal, "Deal created successfully"));
    }
);

//  get single deal
export const getDealByIdController = asyncHandler<{ id: string }>(
    async (req, res) => {
        const userId = req.user!.id;
        const { id } = req.params;

        const deal = await brandDealService.getDealById(userId, id);

        return res.status(200).json(new ApiResponse(200, deal, "Deal fetched"));
    }
);

// listing the deals with pagination and filters
export const listDealsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.id;

        const filters = req.validatedQuery as unknown as ListDealsQuery;

        const result = await brandDealService.listDeals(userId, filters);

        return res.status(200).json(new ApiResponse(200, result, "Deals fetched"));
    }
)

// update the deal fields
export const updateDealController = asyncHandler<{ id: string }, any, UpdateBrandDealInput>(
    async (req, res) => {
        const userId = req.user!.id;
        const { id } = req.params;
        const data = req.body;

        const deal = await brandDealService.updateDeal(userId, id, data);

        return res
            .status(200)
            .json(new ApiResponse(200, deal, "Deal updated successfully"));
    }
);

// updating the deal status
export const updateDealStatusController = asyncHandler<{ id: string }, any, { status: DealStatus }>(async (req, res) => {

    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const deal = await brandDealService.updateDealStatus(userId, id, status);

    return res
        .status(200)
        .json(new ApiResponse(200, deal, "Deal status updated"));
});

// soft deleting the deals
export const deleteDealController = asyncHandler<{ id: string }>(
    async (req, res) => {
        const userId = req.user!.id;
        const { id } = req.params;

        const result = await brandDealService.deleteDeal(userId, id);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Deal deleted successfully"));
    }
);