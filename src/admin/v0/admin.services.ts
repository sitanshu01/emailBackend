import crypto from "crypto";
import { prisma } from "../../db";
import { Type } from "../../../generated/prisma";

// Create a new form
// export const createForm = async (
//   userId: string,
//   formName: string,
//   questions: {
//     question: string;
//     type: keyof typeof Type; // ✅ automatically infers: "TEXT" | "MCQ" | "NUMBER" | "EMAIL"
//     required: boolean;
//     options?: string[];
//   }[]
// ) => {
//   try {
//     if (!formName || !Array.isArray(questions) || questions.length === 0) {
//       return { success: false, error: "Invalid form data" };
//     }

//     const newForm = await prisma.form.create({
//       data: {
//         formName,
//         userId,
//         question: {
//           create: questions.map((q) => ({
//             question: q.question,
//             type: Type[q.type], // ✅ Directly access Prisma enum via keyof
//             required: q.required,
//             options:
//               q.type === "MCQ"
//                 ? {
//                     create:
//                       q.options
//                         ?.filter((opt) => opt && opt.trim() !== "")
//                         .map((opt) => ({ option: opt })) || [],
//                   }
//                 : undefined,
//           })),
//         },
//       },
//       include: {
//         question: { include: { options: true } },
//       },
//     });

//     return { success: true, data: newForm };
//   } catch (error) {
//     console.error("Error creating form:", error);
//     return { success: false, error: "Internal server error" };
//   }
// };

interface QuestionInput {
  questionId?: string; // Add questionId to match usage in updateForm
  question: string;
  type: Type;
  required: boolean;
  options?: string[];
}

export const createForm = async (
  userId: string,
  formName: string,
  questions: QuestionInput[]
) => {
  try {
    const newForm = await prisma.form.create({
      data: {
        formName,
        userId,
        question: {
          create: questions.map((q) => ({
            question: q.question,
            type: q.type,
            required: q.required,
            options: {
              create: q.options?.map((opt) => ({ option: opt })) || [],
            },
          })),
        },
      },
      include: {
        question: {
          include: { options: true },
        },
      },
    });

    return { success: true, data: newForm };
  } catch (error) {
    console.error("Create form error:", error);
    return { success: false, error: "Failed to create form" };
  }
};

//get all forms
export const getForms = async (userId: string) => {
  try {
    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        question: {
          include: { options: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: forms };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch forms" };
  }
}

//get form
export const getForm = async (formId: string, userId: string) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
      include: {
        question: { 
          include: { options: true } 
        },
      },
    });
    if (!form) {
      return { success: false, error: "Form not found" };
    }
    return { success: true, data: form };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch form" };
  }
}

// Update existing form
export const updateForm = async (
  formId: string,
  userId: string,
  formName: string,
  questions: QuestionInput[]
) => {
  try {
    // First verify ownership
    const existingForm = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!existingForm) {
      return { success: false, error: "Form not found or unauthorized" };
    }

    // Delete all existing questions and their options (cascade delete)
    await prisma.question.deleteMany({
      where: { formId },
    });

    // Update form and create new questions
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        formName,
        question: {
          create: questions.map((q) => ({
            question: q.question,
            type: q.type,
            required: q.required,
            options: {
              create: q.options?.map((opt) => ({ option: opt })) || [],
            },
          })),
        },
      },
      include: {
        question: {
          include: { options: true },
        },
      },
    });

    return { success: true, data: updatedForm };
  } catch (error) {
    console.error("Update form error:", error);
    return { success: false, error: "Failed to update form" };
  }
};

// Delete a form
export const deleteForm = async (formId: string, userId: string) => {
  try {
    await prisma.form.delete({
      where: { id: formId, userId },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete form" };
  }
};

// Publish form (generate shareId)
export const publishForm = async (formId: string, userId: string) => {
  try {
    const shareId = crypto.randomUUID();
    const form = await prisma.form.update({
      where: { id: formId, userId },
      data: { shareId },
    });
    return { success: true, data: form };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to publish form" };
  }
};

// Unpublish form
export const unpublishForm = async (formId: string, userId: string) => {
  try {
    const form = await prisma.form.update({
      where: { id: formId, userId },
      data: { shareId: null },
    });
    return { success: true, data: form };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to unpublish form" };
  }
};

// Get submissions with optional branch filtering
export const getSubmissions = async (
  formId: string,
  userId: string,
  branch?: string,
) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        formId,
        form: { userId },
        ...(branch
          ? {
              user: {
                branch: {
                  equals: branch as any, // Cast to 'any' if 'branch' is a string, or use the correct enum type
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            rollNumber: true,
            branch: true,
          },
        },
        answer: true,
      },
    });
    return { success: true, data: submissions };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch submissions" };
  }
};
