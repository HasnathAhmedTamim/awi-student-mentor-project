import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { mentorRouter } from "./modules/mentor/mentor.routes.js";
import { submissionsRouter } from "./modules/submissions/submissions.routes.js";
import { sendSuccess } from "./utils/api-response.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    sendSuccess(res, {
      service: "Student Project Submission & Mentor Review API",
      message: "API is running.",
      healthCheck: "/api/health",
    });
  });

  app.get("/api/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/submissions", submissionsRouter);
  app.use("/api/mentor", mentorRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
