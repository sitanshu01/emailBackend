import { z } from "zod";

export const signupSchema = z.object({
  firstName: z
    .string({
      message: "First name is required",
    })
    .min(1, { message: "Name must be at least 1 character" })
    .max(50, { message: "Name must be less than 50 characters" }),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.email({
    message: "Email address should be valid",
  }),
  rollNumber: z.string({}).regex(/^\d{2}[A-Za-z]{3}\d{3}$/, {
    message: "Invalid Roll Number",
  }),
  branch: z.enum(
    ["CS", "DCS", "EC", "DEC", "ME", "EE", "MS", "MNC", "EP", "CH", "CE"],
    { message: "Valid branch is required" },
  ),
  role: z.enum(["STUDENT", "ADMIN", "SUPERADMIN"], {
    message: "Valid role is required",
  }),
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      },
    ),
});

export const signinSchema = z.object({
  email: z.email({
    message: "Valid email is required",
  }),
  role: z.enum(["SUPERADMIN", "ADMIN", "STUDENT"], {
    message: "Valid role is required",
  }),
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      },
    ),
});
