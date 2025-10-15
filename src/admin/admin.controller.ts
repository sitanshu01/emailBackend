import express, { type Request, type Response } from "express";
import {
  createFormSchema,
  updateOptionSchema,
  updateQuestionSchema,
  updateRequiredSchema,
  updateTypeSchema,
} from "../zod";
import {
  addOption,
  addQuestion,
  approveSubmission,
  createForm,
  deleteForm,
  deleteOption,
  deleteQuestion,
  getSubmissions,
  publishForm,
  rejectSubmission,
  unpublishForm,
  updateOption,
  updateQuestion,
  updateRequired,
  updateType,
} from "./admin.service";

export const adminRouter = express.Router();

// to create form
adminRouter.post("/create/form", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      error: "Unauthorized",
    });
  }
  const isInputValid = createFormSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      error: isInputValid.error.message,
    });
  }
  const { formName } = isInputValid.data;
  const { success: status, error } = await createForm(formName);
  if (!status) {
    return res.status(400).json({
      error: error,
    });
  }
  return res.status(200).json({
    message: "Form created successfully",
  });
});

// to delete form
adminRouter.delete(
  "/delete/form/:formID",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const formID = req.params.formID;
    if (!formID || formID.trim() === "") {
      return res.status(400).json({
        message: "Missing formId",
      });
    }
    const { success: status, error } = await deleteForm(formID);
    if (!status) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Form deleted successfully",
    });
  },
);

// to create question
adminRouter.post(
  "/add/question/:formID",
  async (req: Request, res: Response) => {
    const formId = req.params.formID;
    if (!formId || formId.trim() === "") {
      return res.status(400).json({
        message: "Missing formId",
      });
    }
    const { success: status, error } = await addQuestion(formId);
    if (!status) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Question added successfully",
    });
  },
);

// to delete question
adminRouter.delete(
  "/question/:questionID",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const questionId = req.params.questionID;
    if (!questionId || questionId.trim() === "") {
      return res.status(400).json({
        message: "Missing questionId",
      });
    }
    const { success, error } = await deleteQuestion(questionId, userId);
    if (!success) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Question deleted successfully",
    });
  },
);

// to change question title
adminRouter.put(
  "/question/:questionID",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const questionId = req.params.questionID;
    if (!questionId || questionId.trim() === "") {
      return res.status(400).json({
        message: "Missing questionId",
      });
    }

    const isInputValid = updateQuestionSchema.safeParse(req.body);
    if (!isInputValid.success) {
      return res.status(400).json({
        message: isInputValid.error.message,
      });
    }
    const { question } = isInputValid.data;
    const { success, error } = await updateQuestion(
      questionId,
      question,
      userId,
    );
    if (!success) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Question updated successfully",
    });
  },
);

// to add option to a specific question
adminRouter.post(
  "/add/option/:questionID",
  async (req: Request, res: Response) => {
    const questionId = req.params.questionID;
    if (!questionId || questionId.trim() === "") {
      return res.status(400).json({
        message: "Missing questionId",
      });
    }
    const { success, error } = await addOption(questionId);
    if (!success) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Option added successfully",
    });
  },
);

// to update option title of a certain option
adminRouter.put("/option/:optionID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const optionId = req.params.optionID;
  if (!optionId || optionId.trim() === "") {
    return res.status(400).json({
      message: "Missing optionId",
    });
  }

  const isInputValid = updateOptionSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      message: isInputValid.error.message,
    });
  }
  const { option } = isInputValid.data;
  const { success, error } = await updateOption(optionId, option, userId);
  if (!success) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Option updated successfully",
  });
});

// to delete option of a certain question
adminRouter.delete("/option/:optionID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const optionId = req.params.optionID;
  if (!optionId || optionId.trim() === "") {
    return res.status(400).json({
      message: "Missing optionId",
    });
  }
  const { success, error } = await deleteOption(optionId, userId);
  if (!success) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Option deleted successfully",
  });
});

// to update question type of specific question
adminRouter.put("/type/:questionID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const questionID = req.params.questionID;
  if (!questionID || questionID.trim() === "") {
    return res.status(400).json({
      message: "Missing formId",
    });
  }

  const isInputValid = updateTypeSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      message: isInputValid.error.message,
    });
  }
  const { type } = isInputValid.data;
  const { success, error } = await updateType(questionID, type, userId);
  if (!success) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Type updated successfully",
  });
});

// to update required field of a certain question
adminRouter.put(
  "/required/:questionID",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const questionID = req.params.questionID;
    if (!questionID || questionID.trim() === "") {
      return res.status(400).json({
        message: "Missing questionId",
      });
    }

    const isInputValid = updateRequiredSchema.safeParse(req.body);
    if (!isInputValid.success) {
      return res.status(400).json({
        message: isInputValid.error.message,
      });
    }
    const { required } = isInputValid.data;
    const { success, error } = await updateRequired(
      questionID,
      required,
      userId,
    );
    if (!success) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Required updated successfully",
    });
  },
);

adminRouter.put("/publish/:formID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const formId = req.params.formID;
  if (!formId || formId.trim() === "") {
    return res.status(400).json({
      message: "Missing formId",
    });
  }
  const { success, error } = await publishForm(formId, userId);
  if (!success) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Form published successfully",
  });
});

adminRouter.put("/unpublish/:formID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const formId = req.params.formID;
  if (!formId || formId.trim() === "") {
    return res.status(400).json({
      message: "Missing formId",
    });
  }
  const { success, error } = await unpublishForm(formId, userId);
  if (!success) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Form unpublished successfully",
  });
});

adminRouter.get("/submissions/:formID", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }
  const formId = req.params.formID;
  if (!formId || formId.trim() === "") {
    return res.status(400).json({
      message: "Missing formId",
    });
  }
  const { success, error } = await getSubmissions(formId, userId);
  if (!success) {
    return res.status(500).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "Form unpublished successfully",
  });
});

adminRouter.put(
  "/submission/reject/:studentID/:formID", //t
  async (req: Request, res: Response) => {
    const adminId = req.userId;
    if (!adminId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const formId = req.params.formID;
    if (!formId || formId.trim() === "") {
      return res.status(400).json({
        message: "Missing formId",
      });
    }
    const studentID = req.params.studentID;
    if (!studentID || studentID.trim() === "") {
      return res.status(400).json({
        message: "Missing studentID",
      });
    }
    const { success, error } = await rejectSubmission(
      studentID,
      adminId,
      formId,
    );
    if (!success) {
      return res.status(500).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Submission rejected successfully",
    });
  },
);

adminRouter.put(
  "/submission/approve/:studentID/:formID",
  async (req: Request, res: Response) => {
    const adminId = req.userId;
    if (!adminId) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }
    const formId = req.params.formID;
    if (!formId || formId.trim() === "") {
      return res.status(400).json({
        message: "Missing formId",
      });
    }
    const studentID = req.params.studentID;
    if (!studentID || studentID.trim() === "") {
      return res.status(400).json({
        message: "Missing studentID",
      });
    }
    const { success, error } = await approveSubmission(
      studentID,
      adminId,
      formId,
    );
    if (!success) {
      return res.status(500).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "Submission approved successfully",
    });
  },
);
