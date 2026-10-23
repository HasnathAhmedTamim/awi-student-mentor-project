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

export type FieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  success: false;
  code: string;
  message: string;
  details?: FieldError[];
};
