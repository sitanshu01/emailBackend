import { z } from "zod";

export const verifyOTPSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  otp: z.string({ message: "OTP is required" }),
});

export const sendOTPSchema = z.object({
  email: z.email({ message: "Invalid email" }),
});
