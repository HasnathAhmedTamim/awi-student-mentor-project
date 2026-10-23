import type { RequestHandler } from "express";
import { sendError } from "../utils/api-response.js";

export const notFound: RequestHandler = (req, res) => {
  sendError(res, 404, {
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
};
