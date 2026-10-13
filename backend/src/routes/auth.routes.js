import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateProfile } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").put(verifyJWT, upload.single("avatar"), updateProfile);

export default router;
