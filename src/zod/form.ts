import { z } from "zod";
import { Type } from "../../generated/prisma";
import type { StudentReponse } from "../types";

// Base question fields
const baseQuestionSchema = {
  question: z
    .string()
    .min(5, "Question too short")
    .max(200, "Question too long"),
  required: z.boolean().default(true),
};

// Schema using discriminated union
export const createFormSchema = z.object({
  formName: z
    .string()
    .min(5, "Form name too short")
    .max(100, "Form name too long"),

  questions: z
    .array(
      z.discriminatedUnion("type", [
        // TEXT type question - no options needed
        z.object({
          ...baseQuestionSchema,
          type: z.literal("TEXT"),
        }),
        // MCQ type question - options required
        z.object({
          ...baseQuestionSchema,
          type: z.literal("MCQ"),
          options: z
            .array(
              z
                .string()
                .min(1, "Option cannot be empty")
                .transform((s) => s.trim())
            )
            .min(1, "At least one option is required for multiple choice questions"),
        }),
      ])
    )
    .min(1, "At least one question is required"),
});

// export const updateOptionSchema = z.object({
//   option: z.string().min(1, { message: "option too short" }),
// });

// export const updateQuestionSchema = z.object({
//   question: z.string().min(1, { message: "question too short" }),
// });

// export const updateTypeSchema = z.object({
//   type: z.enum([...Object.values(Type)] as [Type, ...Type[]], {
//     message: "type is required",
//   }) as z.ZodType<Type>,
// });

// export const updateRequiredSchema = z.object({
//   required: z.boolean({ message: "required field is required" }),
// });

export const formSubmissionSchema = z.object({
  response: z.array(
    z.object({
      questionId: z.string(),
      response: z.string(),
    }) as z.ZodType<StudentReponse>,
  ),
});
