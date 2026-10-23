"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/shared/form-error";
import { fieldDescriptionId, FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
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
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { projectName: "", repositoryUrl: "", liveUrl: "", description: "" },
  });
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
      <FormError message={errors.root?.message} />

      <FormField id="projectName" label="Project name" error={errors.projectName?.message}>
        <Input
          id="projectName"
          maxLength={120}
          aria-invalid={!!errors.projectName}
          aria-describedby={fieldDescriptionId("projectName")}
          {...register("projectName")}
        />
      </FormField>

      <FormField
        id="repositoryUrl"
        label="GitHub repository URL"
        error={errors.repositoryUrl?.message}
        hint="For example https://github.com/your-name/your-project"
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
        label="Live URL"
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
        label="Description"
        error={errors.description?.message}
        hint="What the project does and which technologies it uses (10–2000 characters)."
      >
        <Textarea
          id="description"
          rows={6}
          maxLength={2000}
          aria-invalid={!!errors.description}
          aria-describedby={fieldDescriptionId("description")}
          {...register("description")}
        />
      </FormField>

      <SubmitButton pending={isSubmitting || submitted} pendingLabel="Submitting…" className="w-full sm:w-auto">
        Submit project
      </SubmitButton>
    </form>
  );
}
