"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/shared/form-error";
import { fieldDescriptionId, FormField } from "@/components/shared/form-field";
import { AppLink } from "@/components/shared/app-link";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResetWhenHidden } from "@/hooks/use-reset-when-hidden";
import { api } from "@/lib/api/client";
import { applyApiError } from "@/lib/forms";
import { submissionSchema, type SubmissionValues } from "@/lib/validations/submission";
import type { Submission } from "@/types/submission";

const FIELDS = ["projectName", "repositoryUrl", "liveUrl", "description"] as const;

export function SubmissionForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { projectName: "", repositoryUrl: "", liveUrl: "", description: "" },
  });
  const descriptionLength = useWatch({ control, name: "description" }).length;
  const resetWhenHidden = useResetWhenHidden(
    useCallback(() => {
      reset();
      setSubmitted(false);
    }, [reset]),
  );

  async function onSubmit(values: SubmissionValues) {
    try {
      await api.post<{ submission: Submission }>("/submissions", values);
      setSubmitted(true);
      resetWhenHidden();
      toast.success("Project submitted for review.");
      router.replace("/student/dashboard");
      router.refresh();
    } catch (error) {
      applyApiError(error, setError, FIELDS);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <p className="text-sm text-muted-foreground">All fields are required.</p>
      <FormError message={errors.root?.message} />

      <FormField id="projectName" label="Project name (required)" error={errors.projectName?.message}>
        <Input
          id="projectName"
          maxLength={120}
          autoFocus
          placeholder="e.g. Student Portfolio Website"
          aria-invalid={!!errors.projectName}
          aria-describedby={fieldDescriptionId("projectName")}
          {...register("projectName")}
        />
      </FormField>

      <FormField
        id="repositoryUrl"
        label="GitHub repository URL (required)"
        error={errors.repositoryUrl?.message}
        hint="Use a public GitHub repository URL, such as https://github.com/your-name/your-project. You can resubmit the same repository after it is rejected."
      >
        <Input
          id="repositoryUrl"
          type="url"
          inputMode="url"
          maxLength={300}
          placeholder="https://github.com/owner/repo"
          aria-invalid={!!errors.repositoryUrl}
          aria-describedby={fieldDescriptionId("repositoryUrl")}
          {...register("repositoryUrl")}
        />
      </FormField>

      <FormField
        id="liveUrl"
        label="Live URL (required)"
        error={errors.liveUrl?.message}
        hint="Where the deployed project can be viewed."
      >
        <Input
          id="liveUrl"
          type="url"
          inputMode="url"
          maxLength={300}
          placeholder="https://my-project.vercel.app"
          aria-invalid={!!errors.liveUrl}
          aria-describedby={fieldDescriptionId("liveUrl")}
          {...register("liveUrl")}
        />
      </FormField>

      <FormField
        id="description"
        label="Description (required)"
        error={errors.description?.message}
        hint="What the project does and which technologies it uses (at least 10 characters)."
        aside={`${descriptionLength}/2000`}
      >
        <Textarea
          id="description"
          rows={6}
          maxLength={2000}
          placeholder="Describe what your project does, its key features, and technologies used."
          aria-invalid={!!errors.description}
          aria-describedby={fieldDescriptionId("description")}
          {...register("description")}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <AppLink href="/student/dashboard">Cancel</AppLink>
        </Button>
        <SubmitButton pending={isSubmitting || submitted} pendingLabel="Submitting…" className="w-full sm:w-auto">
          Submit project
        </SubmitButton>
      </div>
    </form>
  );
}
