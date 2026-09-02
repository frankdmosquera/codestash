import { z } from "zod";

export const signInValidationSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Required"),
});

export type SignInValidationInput = z.infer<typeof signInValidationSchema>;

export const signUpValidationSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  email: z.email(),
  password: z.string().min(8, "Minimum of 8 characters required"),
});

export type SignUpValidationInput = z.infer<typeof signUpValidationSchema>;

export const emailOtpRequestValidationSchema = z.object({
  email: z.email(),
});

export type EmailOtpRequestValidationInput = z.infer<
  typeof emailOtpRequestValidationSchema
>;

export const emailOtpVerifyValidationSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

export type EmailOtpVerifyValidationInput = z.infer<
  typeof emailOtpVerifyValidationSchema
>;
