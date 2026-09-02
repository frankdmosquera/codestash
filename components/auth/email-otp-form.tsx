"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import {
  emailOtpRequestValidationSchema,
  emailOtpVerifyValidationSchema,
  type EmailOtpRequestValidationInput,
  type EmailOtpVerifyValidationInput,
} from "@/lib/validations/auth-validation";

export function EmailOtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const requestForm = useForm<EmailOtpRequestValidationInput>({
    resolver: zodResolver(emailOtpRequestValidationSchema),
    defaultValues: { email: "" },
  });

  const requestOtp = useMutation({
    mutationFn: async (values: EmailOtpRequestValidationInput) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, values) => setEmail(values.email),
  });

  const verifyForm = useForm<EmailOtpVerifyValidationInput>({
    resolver: zodResolver(emailOtpVerifyValidationSchema),
    defaultValues: { otp: "" },
  });

  const verifyOtp = useMutation({
    mutationFn: async (values: EmailOtpVerifyValidationInput) => {
      if (!email) throw new Error("Missing email");
      const { data, error } = await authClient.signIn.emailOtp({
        email,
        otp: values.otp,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  if (!email) {
    return (
      <form
        onSubmit={requestForm.handleSubmit((values) => requestOtp.mutate(values))}
        className="space-y-4"
      >
        <Controller
          name="email"
          control={requestForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="otp-email">Email</FieldLabel>
              <Input
                {...field}
                id="otp-email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {requestOtp.error && (
          <p className="text-sm text-destructive">
            {requestOtp.error.message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={requestOtp.isPending}
        >
          {requestOtp.isPending ? "Sending code..." : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={verifyForm.handleSubmit((values) => verifyOtp.mutate(values))}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium">{email}</span>.
      </p>
      <Controller
        name="otp"
        control={verifyForm.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="otp">Code</FieldLabel>
            <Input
              {...field}
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {verifyOtp.error && (
        <p className="text-sm text-destructive">{verifyOtp.error.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={verifyOtp.isPending}
      >
        {verifyOtp.isPending ? "Verifying..." : "Verify & sign in"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setEmail(null)}
      >
        Use a different email
      </Button>
    </form>
  );
}
