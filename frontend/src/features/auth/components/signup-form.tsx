"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/shared/form-error";
import { fieldDescriptionId, FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { useResetWhenHidden } from "@/hooks/use-reset-when-hidden";
import { api } from "@/lib/api/client";
import { dashboardPath } from "@/lib/auth/constants";
import { applyApiError } from "@/lib/forms";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import type { User } from "@/types/user";

export function SignupForm() {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const resetWhenHidden = useResetWhenHidden(reset);

  async function onSubmit({ name, email, password }: SignupValues) {
    try {
      const { data } = await api.post<{ user: User }>("/auth/signup", { name, email, password });
      resetWhenHidden();
      toast.success("Account created. Welcome!");
      startNavigation(() => {
        router.replace(dashboardPath(data.user.role));
        router.refresh();
      });
    } catch (error) {
      applyApiError(error, setError, ["name", "email", "password"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.message} />

      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          autoFocus
          placeholder="Enter your full name"
          aria-invalid={!!errors.name}
          aria-describedby={fieldDescriptionId("name")}
          {...register("name")}
        />
      </FormField>

      <FormField id="email" label="Email address" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={fieldDescriptionId("email")}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters, including a letter and a number."
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a password"
          aria-invalid={!!errors.password}
          aria-describedby={fieldDescriptionId("password")}
          {...register("password")}
        />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={fieldDescriptionId("confirmPassword")}
          {...register("confirmPassword")}
        />
      </FormField>

      <SubmitButton pending={isSubmitting || navigating} pendingLabel="Creating account…" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
