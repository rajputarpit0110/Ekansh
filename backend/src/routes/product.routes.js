import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

// Admin only routes
router.use(verifyJWT, authorizeRoles("admin", "superadmin"));
router.route("/").post(
    upload.fields([
        { name: "images", maxCount: 5 },
        { name: "video", maxCount: 1 }
    ]), 
    createProduct
);
router.route("/:id")
    .put(
        upload.fields([
            { name: "images", maxCount: 5 },
            { name: "video", maxCount: 1 }
        ]), 
        updateProduct
    )
    .delete(deleteProduct);

export default router;
