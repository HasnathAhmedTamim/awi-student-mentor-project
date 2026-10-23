import type { Response } from "express";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiErrorBody = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { statusCode?: number; meta?: PaginationMeta } = {},
) {
  const body: ApiSuccess<T> = { success: true, data };
  if (options.meta) body.meta = options.meta;
  return res.status(options.statusCode ?? 200).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  error: Omit<ApiErrorBody, "success">,
) {
  const body: ApiErrorBody = { success: false, ...error };
  return res.status(statusCode).json(body);
}
