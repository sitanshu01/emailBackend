import { z } from "zod";

export const createAdminSchema = z.object({
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
  branch: z.enum(
    ["CS", "DCS", "EC", "DEC", "ME", "EE", "MS", "MNC", "EP", "CH", "CE"],
    { message: "Valid branch is required" },
  ),
});

export const deleteAdminSchema = z.object({
  email: z.email({
    message: "Email address should be valid",
  }),
});
