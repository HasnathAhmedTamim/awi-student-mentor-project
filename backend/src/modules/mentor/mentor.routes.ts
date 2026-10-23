import { Router } from "express";
import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRoles } from "../../middlewares/authorize-roles.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { submissionIdParamsSchema } from "../submissions/submissions.validation.js";
import * as mentorController from "./mentor.controller.js";
import { listMentorSubmissionsQuerySchema, reviewSubmissionSchema } from "./mentor.validation.js";

export const mentorRouter = Router();

mentorRouter.use(authenticate, authorizeRoles(Role.MENTOR));

mentorRouter.get(
  "/submissions",
  validateRequest({ query: listMentorSubmissionsQuerySchema }),
  mentorController.listSubmissions,
);
mentorRouter.get("/statistics", mentorController.getStatistics);
mentorRouter.patch(
  "/submissions/:id/status",
  validateRequest({ params: submissionIdParamsSchema, body: reviewSubmissionSchema }),
  mentorController.reviewSubmission,
);
