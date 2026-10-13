import { Router } from "express";
import { processStripePayment, processRazorpayPayment, getRazorpayKey } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/stripe/process").post(processStripePayment);
router.route("/razorpay/process").post(processRazorpayPayment);
router.route("/razorpay/key").get(getRazorpayKey);

export default router;
