import type { Request, Response } from "express";
import { getAuthUser } from "../../middlewares/authenticate.js";
import { sendSuccess } from "../../utils/api-response.js";
import * as mentorService from "./mentor.service.js";
import type { ListMentorSubmissionsQuery, ReviewSubmissionInput } from "./mentor.validation.js";

export async function listSubmissions(req: Request, res: Response) {
  const { submissions, meta } = await mentorService.listSubmissions(
    req.query as unknown as ListMentorSubmissionsQuery,
  );
  sendSuccess(res, { submissions }, { meta });
}

export async function getStatistics(_req: Request, res: Response) {
  const statistics = await mentorService.getStatistics();
  sendSuccess(res, { statistics });
}

export async function reviewSubmission(
  req: Request<{ id: string }, unknown, ReviewSubmissionInput>,
  res: Response,
) {
  const submission = await mentorService.reviewSubmission(
    getAuthUser(req).id,
    req.params.id,
    req.body,
  );
  sendSuccess(res, { submission });
}
