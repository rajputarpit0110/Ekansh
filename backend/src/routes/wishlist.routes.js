import { Router } from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getWishlist).post(toggleWishlist);

export default router;
