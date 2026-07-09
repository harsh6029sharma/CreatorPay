import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { createBrandDealSchema, listDealsQuerySchema, updateBrandDealSchema, updateDealStatusSchema } from "../validators/brandDeal.validator";
import { createDealController, getDealByIdController, listDealsController, updateDealController, updateDealStatusController } from "../controllers/brandDeal.controller";

const router = Router()

// all brand deal routes are protected
router.use(verifyJwt)

router.post("/", validate(createBrandDealSchema), createDealController)
router.get("/",validate(listDealsQuerySchema), listDealsController)
router.get("/:id", getDealByIdController)
router.patch("/:id", validate(updateBrandDealSchema), updateDealController)
router.patch("/:id/status",validate(updateDealStatusSchema), updateDealStatusController)

export default router