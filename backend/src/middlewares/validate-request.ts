import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

/**
 * Validates and replaces `req.body`, `req.params` and `req.query` with parsed values.
 * A failed parse throws a ZodError, which the error handler turns into a 400.
 */
export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as typeof req.params;
    }
    if (schemas.query) {
      // Express 5 exposes req.query as a getter, so it has to be redefined.
      Object.defineProperty(req, "query", {
        value: schemas.query.parse(req.query),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body ?? {});
    }
    next();
  };
}
