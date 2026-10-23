import type { Request, Response } from "express";
import { getAuthUser } from "../../middlewares/authenticate.js";
import { sendSuccess } from "../../utils/api-response.js";
import type { PaginationQuery } from "../../utils/pagination.js";
import * as submissionsService from "./submissions.service.js";
import type { CreateSubmissionInput } from "./submissions.types.js";

export async function create(req: Request<object, unknown, CreateSubmissionInput>, res: Response) {
  const submission = await submissionsService.createSubmission(getAuthUser(req).id, req.body);
  sendSuccess(res, { submission }, { statusCode: 201 });
}

export async function listMine(req: Request, res: Response) {
  const { submissions, meta } = await submissionsService.listStudentSubmissions(
    getAuthUser(req).id,
    req.query as unknown as PaginationQuery,
  );
  sendSuccess(res, { submissions }, { meta });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const submission = await submissionsService.getSubmissionForUser(getAuthUser(req), req.params.id);
  sendSuccess(res, { submission });
}
