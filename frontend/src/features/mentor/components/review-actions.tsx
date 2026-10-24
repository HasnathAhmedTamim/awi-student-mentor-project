"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormError } from "@/components/shared/form-error";
import { fieldDescriptionId, FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type DashboardView, mentorDashboardHref, mentorSubmissionHref } from "@/features/mentor/dashboard-href";
import { ApiError } from "@/lib/api/api-error";
import { api } from "@/lib/api/client";
import { applyApiError } from "@/lib/forms";
import {
  REJECTION_NOTE_REQUIRED,
  REVIEW_NOTE_MAX_LENGTH,
  reviewSchema,
  type ReviewValues,
} from "@/lib/validations/review";
import type { MentorSubmission, SubmissionDetail } from "@/types/submission";

type Decision = { status: "APPROVED" | "REJECTED"; reviewNote: string };

/** Errors after which the page must be reloaded: the submission was reviewed or deleted, or the session ended. */
const STALE_PAGE_STATUSES = [401, 404, 409];

export function ReviewActions({
  submission,
  view,
}: {
  submission: Pick<SubmissionDetail, "id" | "projectName" | "status">;
  view: DashboardView;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [findingNext, setFindingNext] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviewNote: "" },
  });
  const noteLength = useWatch({ control, name: "reviewNote" }).length;

  const choose = (status: Decision["status"]) =>
    handleSubmit(({ reviewNote }) => {
      if (status === "REJECTED" && !reviewNote) {
        setError("reviewNote", { message: REJECTION_NOTE_REQUIRED }, { shouldFocus: true });
        return;
      }
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
      setPending(false);
      setReviewed(true);
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

  async function reviewNext() {
    setFindingNext(true);
    try {
      const query = new URLSearchParams({ status: "PENDING", limit: "1" });
      if (view.q) query.set("q", view.q);
      const { data } = await api.get<{ submissions: MentorSubmission[] }>(
        `/mentor/submissions?${query.toString()}`,
      );
      const next = data.submissions[0];
      if (!next) {
        toast.info("No pending submissions remain in this queue.");
        router.push(mentorDashboardHref({ status: "PENDING", q: view.q }));
        return;
      }
      router.push(mentorSubmissionHref(next.id, { status: "PENDING", q: view.q }));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not load the next pending submission.",
      );
    } finally {
      setFindingNext(false);
    }
  }

  const approving = decision?.status === "APPROVED";

  if (!reviewed && submission.status !== "PENDING") return null;

  return (
    <div className="space-y-4">
      {reviewed ? (
        <div className="space-y-3">
          <p role="status">
            Submission {decision?.status.toLowerCase()}. Continue through the pending queue when you&apos;re ready.
          </p>
          <Button type="button" className="w-full" disabled={findingNext} onClick={reviewNext}>
            {findingNext ? "Finding next submission…" : "Review next pending submission"}
            {!findingNext && <ArrowRightIcon aria-hidden="true" />}
          </Button>
        </div>
      ) : (
        <>
          <FormError message={errors.root?.message} />

          <FormField
            id="reviewNote"
            label="Review note"
            error={errors.reviewNote?.message}
            hint="Shown to the student. Required when rejecting."
            aside={`${noteLength}/${REVIEW_NOTE_MAX_LENGTH}`}
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

          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full whitespace-nowrap"
              disabled={pending}
              onClick={choose("APPROVED")}
            >
              <CheckIcon aria-hidden="true" />
              Approve submission
            </Button>
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="w-full whitespace-nowrap"
              disabled={pending}
              onClick={choose("REJECTED")}
            >
              <XIcon aria-hidden="true" />
              Reject submission
            </Button>
          </div>
        </>
      )}

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
        confirmLabel={approving ? "Approve submission" : "Reject submission"}
        pendingLabel={approving ? "Approving…" : "Rejecting…"}
        destructive={!approving}
        pending={pending}
        onConfirm={confirm}
      />
    </div>
  );
}
