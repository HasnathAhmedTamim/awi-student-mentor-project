"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormError } from "@/components/shared/form-error";
import { fieldDescriptionId, FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/api-error";
import { api } from "@/lib/api/client";
import { applyApiError } from "@/lib/forms";
import { REVIEW_NOTE_MAX_LENGTH, reviewSchema, type ReviewValues } from "@/lib/validations/review";
import type { SubmissionDetail } from "@/types/submission";

type Decision = { status: "APPROVED" | "REJECTED"; reviewNote: string };

/** Errors after which the page must be reloaded: the submission was reviewed or deleted, or the session ended. */
const STALE_PAGE_STATUSES = [401, 404, 409];

export function ReviewActions({ submission }: { submission: Pick<SubmissionDetail, "id" | "projectName"> }) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviewNote: "" },
  });

  const choose = (status: Decision["status"]) =>
    handleSubmit(({ reviewNote }) => {
      setDecision({ status, reviewNote });
      setDialogOpen(true);
    });

  async function confirm() {
    if (!decision) return;
    setPending(true);
    try {
      await api.patch<{ submission: SubmissionDetail }>(
        `/mentor/submissions/${encodeURIComponent(submission.id)}/status`,
        decision,
      );
      toast.success(decision.status === "APPROVED" ? "Submission approved." : "Submission rejected.");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      setPending(false);
      setDialogOpen(false);
      if (error instanceof ApiError && STALE_PAGE_STATUSES.includes(error.status)) {
        toast.error(error.message);
        router.refresh();
      } else {
        applyApiError(error, setError, ["reviewNote"]);
      }
    }
  }

  const approving = decision?.status === "APPROVED";

  return (
    <div className="space-y-4">
      <FormError message={errors.root?.message} />

      <FormField
        id="reviewNote"
        label="Review note (optional)"
        error={errors.reviewNote?.message}
        hint={`Shown to the student. Up to ${REVIEW_NOTE_MAX_LENGTH} characters.`}
      >
        <Textarea
          id="reviewNote"
          rows={4}
          maxLength={REVIEW_NOTE_MAX_LENGTH}
          disabled={pending}
          aria-invalid={!!errors.reviewNote}
          aria-describedby={fieldDescriptionId("reviewNote")}
          {...register("reviewNote")}
        />
      </FormField>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" disabled={pending} onClick={choose("APPROVED")}>
          <CheckIcon aria-hidden="true" />
          Approve
        </Button>
        <Button type="button" variant="destructive" disabled={pending} onClick={choose("REJECTED")}>
          <XIcon aria-hidden="true" />
          Reject
        </Button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={approving ? "Approve this submission?" : "Reject this submission?"}
        description={
          <>
            &ldquo;{submission.projectName}&rdquo; will be marked as {approving ? "approved" : "rejected"}
            {decision?.reviewNote ? " and the student will see your note" : ""}. Reviews are final and
            cannot be changed.
          </>
        }
        confirmLabel={approving ? "Approve" : "Reject"}
        pendingLabel={approving ? "Approving…" : "Rejecting…"}
        destructive={!approving}
        pending={pending}
        onConfirm={confirm}
      />
    </div>
  );
}
