import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/api-error";

/**
 * Maps an API error onto a react-hook-form instance: field errors go to their
 * inputs, everything else becomes a form-level ("root") error. Input is preserved.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  if (!(error instanceof ApiError)) {
    setError("root", { message: "Something went wrong. Please try again." });
    return;
  }

  const fieldErrors = error.details.filter((detail) =>
    (fields as readonly string[]).includes(detail.field),
  );

  for (const detail of fieldErrors) {
    setError(detail.field as Path<T>, { message: detail.message });
  }

  if (fieldErrors.length === 0) {
    setError("root", { message: error.message });
  }
}
