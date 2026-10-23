import { Router } from "express";
import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRoles } from "../../middlewares/authorize-roles.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import * as mentorController from "./mentor.controller.js";
import { listMentorSubmissionsQuerySchema } from "./mentor.validation.js";

export const mentorRouter = Router();

mentorRouter.use(authenticate, authorizeRoles(Role.MENTOR));

mentorRouter.get(
  "/submissions",
  validateRequest({ query: listMentorSubmissionsQuerySchema }),
  mentorController.listSubmissions,
);
mentorRouter.get("/statistics", mentorController.getStatistics);
