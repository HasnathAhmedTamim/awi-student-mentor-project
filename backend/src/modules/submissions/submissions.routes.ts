import { Router } from "express";
import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRoles } from "../../middlewares/authorize-roles.js";
import { submissionRateLimiter } from "../../middlewares/rate-limit.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import * as submissionsController from "./submissions.controller.js";
import {
  createSubmissionSchema,
  listMySubmissionsQuerySchema,
  submissionIdParamsSchema,
} from "./submissions.validation.js";

export const submissionsRouter = Router();

submissionsRouter.use(authenticate);

submissionsRouter.post(
  "/",
  authorizeRoles(Role.STUDENT),
  submissionRateLimiter,
  validateRequest({ body: createSubmissionSchema }),
  submissionsController.create,
);
submissionsRouter.get(
  "/mine",
  authorizeRoles(Role.STUDENT),
  validateRequest({ query: listMySubmissionsQuerySchema }),
  submissionsController.listMine,
);
submissionsRouter.get(
  "/:id",
  authorizeRoles(Role.STUDENT, Role.MENTOR),
  validateRequest({ params: submissionIdParamsSchema }),
  submissionsController.getById,
);
