import { Router } from "express";
import { createCoupon, validateCoupon, getAllCoupons } from "../controllers/coupon.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/validate").post(verifyJWT, validateCoupon);

// Admin Routes
router.use(verifyJWT, authorizeRoles("admin", "superadmin"));
router.route("/").post(createCoupon).get(getAllCoupons);

export default router;
