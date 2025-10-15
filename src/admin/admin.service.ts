import type { Type } from "../../generated/prisma";
import { prisma } from "../db";

export const createForm = async (formName: string) => {
  try {
    const form = await prisma.form.create({
      data: {
        formName,
        userId: "abc",
      },
    });
    return { success: true, data: form };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const deleteForm = async (id: string) => {
  try {
    const form = await prisma.form.delete({
      where: {
        id,
      },
    });
    return { success: true, data: form };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const addQuestion = async (formId: string) => {
  try {
    const questionCreated = await prisma.question.create({
      data: {
        formId,
        question: "",
      },
    });
    return { success: true, data: questionCreated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const deleteQuestion = async (questionId: string, userId: string) => {
  try {
    const questionDeleted = await prisma.question.delete({
      where: {
        id: questionId,
        form: {
          userId,
        },
      },
    });
    return { success: true, data: questionDeleted };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const addOption = async (questionId: string) => {
  try {
    const optionCreated = await prisma.option.create({
      data: {
        questionId,
        option: "",
      },
    });
    return { success: true, data: optionCreated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const deleteOption = async (optionId: string, userId: string) => {
  try {
    const optionDeleted = await prisma.option.delete({
      where: {
        id: optionId,
        question: {
          form: {
            userId,
          },
        },
      },
    });
    return { success: true, data: optionDeleted };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const updateOption = async (
  optionId: string,
  option: string,
  userId: string,
) => {
  try {
    const optionUpdated = await prisma.option.update({
      where: {
        id: optionId,
        question: {
          form: {
            userId,
          },
        },
      },
      data: {
        option,
      },
    });
    return { success: true, data: optionUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const updateQuestion = async (
  questionId: string,
  question: string,
  userId: string,
) => {
  try {
    const questionUpdated = await prisma.question.update({
      where: {
        id: questionId,
        form: {
          userId,
        },
      },
      data: {
        question,
      },
    });
    return { success: true, data: questionUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const updateType = async (
  questionID: string,
  type: Type,
  userId: string,
) => {
  try {
    const formUpdated = await prisma.question.update({
      where: {
        id: questionID,
        form: {
          userId,
        },
      },
      data: {
        type,
      },
    });
    return { success: true, data: formUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const updateRequired = async (
  questionID: string,
  required: boolean,
  userId: string,
) => {
  try {
    const formUpdated = await prisma.question.update({
      where: {
        id: questionID,
        form: {
          userId,
        },
      },
      data: {
        required,
      },
    });
    return { success: true, data: formUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const publishForm = async (formId: string, userId: string) => {
  const shareId = crypto.randomUUID();
  try {
    const formUpdated = await prisma.form.update({
      where: {
        id: formId,
        userId,
      },
      data: {
        shareId,
      },
    });
    return { success: true, data: formUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const unpublishForm = async (formId: string, userId: string) => {
  try {
    const formUpdated = await prisma.form.update({
      where: {
        id: formId,
        userId,
      },
      data: {
        shareId: null,
      },
    });
    return { success: true, data: formUpdated };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const getSubmissions = async (formId: string, userId: string) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        formId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            rollNumber: true,
            branch: true,
          },
        },
        answer: true,
        form: {
          include: {
            question: true,
          },
        },
      },
    });
    return { success: true, data: submissions };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const rejectSubmission = async (
  studentID: string,
  adminID: string,
  formID: string,
) => {
  try {
    const submission = await prisma.user.update({
      where: {
        id: studentID,
        form: {
          id: formID,
          userId: adminID,
        },
      },
      data: {
        status: "REJECTED",
      },
    });
    return { success: true, data: submission };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};

export const approveSubmission = async (
  studentID: string,
  adminID: string,
  formID: string,
) => {
  try {
    const submission = await prisma.user.update({
      where: {
        id: studentID,
        form: {
          id: formID,
          userId: adminID,
        },
      },
      data: {
        status: "APPROVED",
      },
    });
    return { success: true, data: submission };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Something went wrong. Please try again later",
    };
  }
};
