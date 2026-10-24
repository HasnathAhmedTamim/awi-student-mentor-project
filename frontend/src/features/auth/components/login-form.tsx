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
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { User } from "@/types/user";

export function LoginForm() {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const resetWhenHidden = useResetWhenHidden(reset);

  async function onSubmit(values: LoginValues) {
    try {
      const { data } = await api.post<{ user: User }>("/auth/login", values);
      resetWhenHidden();
      toast.success(`Welcome back, ${data.user.name}.`);
      startNavigation(() => {
        router.replace(dashboardPath(data.user.role));
        router.refresh();
      });
    } catch (error) {
      applyApiError(error, setError, ["email", "password"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.message} />

      <FormField id="email" label="Email address" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          aria-describedby={fieldDescriptionId("email")}
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={!!errors.password}
          aria-describedby={fieldDescriptionId("password")}
          {...register("password")}
        />
      </FormField>

      <SubmitButton pending={isSubmitting || navigating} pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
