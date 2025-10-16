import logger from "../config/logger";
import { prisma } from "../db";
import type { StudentReponse } from "../types";
import { Status } from "../../generated/prisma";

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
    logger.error(error);
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
    logger.error(error);
    return {
      success: false,
      statusCode: 500,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const submitForm = async (
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
    await prisma.answer.createMany({
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
    logger.error(error);
    return {
      success: false,
      statusCode: 500,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const getStudentDashboardSummary = async (studentId: string) => {
  try {
    const totalSubmissions = await prisma.submission.count({
      where: { userId: studentId },
    });

    const pendingSubmissions = await prisma.submission.count({
      where: { userId: studentId, status: Status.PENDING },
    });

    const approvedSubmissions = await prisma.submission.count({
      where: { userId: studentId, status: Status.APPROVED },
    });

    const rejectedSubmissions = await prisma.submission.count({
      where: { userId: studentId, status: Status.REJECTED },
    });

    const submittedForms = await prisma.submission.findMany({
      where: { userId: studentId },
      select: {
        id: true,
        status: true,
        form: {
          select: {
            id: true,
            formName: true,
          },
        },
      },
    });

    const formsSummary = submittedForms.map((submission) => ({
      submissionId: submission.id,
      formId: submission.form.id,
      formName: submission.form.formName,
      status: submission.status,
    }));

    return {
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        formsSummary,
      },
      statusCode: 200,
    };
  } catch (error) {
    logger.error("Error fetching student dashboard summary:", error);
    return {
      success: false,
      statusCode: 500,
      error: "Failed to fetch student dashboard summary",
    };
  }
};