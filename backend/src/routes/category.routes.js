import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllCategories);

// Admin only routes
router.use(verifyJWT, authorizeRoles("admin", "superadmin"));
router.route("/").post(upload.single("image"), createCategory);
router.route("/:id")
    .put(upload.single("image"), updateCategory)
    .delete(deleteCategory);

export default router;
