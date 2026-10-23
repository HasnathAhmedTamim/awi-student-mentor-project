import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { loginRateLimiter, signupRateLimiter } from "../../middlewares/rate-limit.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import * as authController from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  signupRateLimiter,
  validateRequest({ body: signupSchema }),
  authController.signup,
);
authRouter.post(
  "/login",
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login,
);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
