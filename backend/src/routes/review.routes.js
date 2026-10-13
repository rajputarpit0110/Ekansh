import { Router } from "express";
import { addReview, approveReview, getApprovedReviews } from "../controllers/review.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/:productId").get(getApprovedReviews);
router.route("/").post(verifyJWT, upload.fields([{ name: "images", maxCount: 3 }]), addReview);
router.route("/:productId/approve/:reviewId").put(verifyJWT, authorizeRoles("admin", "superadmin"), approveReview);

export default router;
