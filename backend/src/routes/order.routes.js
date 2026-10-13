import { Router } from "express";
import { placeOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrdersAdmin } from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(placeOrder).get(authorizeRoles("admin", "superadmin"), getAllOrdersAdmin);
router.route("/myorders").get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/status").put(authorizeRoles("admin", "superadmin"), updateOrderStatus);

export default router;
