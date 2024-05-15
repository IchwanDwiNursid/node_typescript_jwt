import express from "express";
import { userController } from "../controller/userController";
import { authMiddleware } from "../middleware/authMiddleware";

export const router = express.Router();

router.post("/api/users/register", userController.register);
router.get("/api/users/", authMiddleware, userController.get);
router.post("/api/users/login", userController.login);
router.patch("/api/users/", userController.update);
router.delete("/api/users/logout", userController.logout);
