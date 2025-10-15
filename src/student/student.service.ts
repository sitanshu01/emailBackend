import { prisma } from "../db";
import type { StudentReponse } from "../types";

export const getStudentProfile = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        rollNumber: true,
        branch: true,
        status: true,
        emailAlloted: true,
      },
    });
    return { success: true, data: user, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      statusCode: 500,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const getForm = async (shareId: string) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        shareId,
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });
    return { success: true, data: form, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      statusCode: 500,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const sumiteForm = async (
  studentId: string,
  shareId: string,
  response: StudentReponse[],
) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        shareId,
      },
      select: {
        id: true,
      },
    });
    if (!form) {
      return {
        success: false,
        statusCode: 400,
        error: "Form not found",
      };
    }
    const submission = await prisma.submission.create({
      data: {
        userId: studentId,
        formId: form.id,
      },
    });
    prisma.answer.createMany({
      data: response.map((res) => {
        return {
          questionId: res.questionId,
          response: res.response,
          submissionId: submission.id,
        };
      }),
    });
    return {
      success: true,
      statusCode: 200,
      message: "Form submitted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      statusCode: 500,
      error: "Something went wrong. Please try again later",
    };
  }
};
