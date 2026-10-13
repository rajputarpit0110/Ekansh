import { Router } from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCart).post(addToCart).delete(clearCart);
router.route("/:productId").delete(removeFromCart);

export default router;
