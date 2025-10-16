import express, { type Request, type Response } from "express";
import { getForm, getStudentProfile, submitForm, getStudentDashboardSummary } from "./student.service";
import { formSubmissionSchema } from "../zod";

export const studentRouter = express.Router();

// Get student dashboard summary
studentRouter.get("/dashboard/summary", async (req: Request, res: Response) => {
  const studentId = req.userId;
  if (!studentId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { data, success, error, statusCode } = await getStudentDashboardSummary(studentId);

  if (success) {
    return res.status(statusCode).json({
      message: "Student dashboard summary fetched successfully",
      data,
    });
  } else {
    return res.status(statusCode).json({ message: error });
  }
});

// to get his profile
studentRouter.get("/profile", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }

  const { data, success, error, statusCode } = await getStudentProfile(userId);
  if (!success) {
    return res.status(statusCode).json({
      message: error,
      data,
    });
  }

  return res.status(statusCode).json({
    message: "successufull",
    data,
  });
});

// to get the form
studentRouter.get("/form/:shareId", async (req: Request, res: Response) => {
  const shareId = req.params.shareId;
  if (!shareId || shareId.trim() === "") {
    return res.status(400).json({
      error: "Form ID is required",
    });
  }

  const { data, success, error, statusCode } = await getForm(shareId);
  if (!success) {
    return res.status(statusCode).json({
      error,
    });
  }

  return res.status(statusCode).json({
    data,
  });
});

// to submit hte form
studentRouter.post("/form/:shareId", async (req: Request, res: Response) => {
  const studentId = req.userId;
  if (!studentId) {
    return res.status(400).json({
      error: "Unauthorized",
    });
  }

  const shareId = req.params.shareId;
  if (!shareId || shareId.trim() === "") {
    return res.status(400).json({
      error: "Form ID is required",
    });
  }

  const isInputValid = formSubmissionSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      error: isInputValid.error.message,
    });
  }

  const { response } = isInputValid.data;

      const { message, success, error, statusCode } = await submitForm(    studentId,
    shareId,
    response,
  );
  if (!success) {
    return res.status(statusCode).json({
      error,
    });
  }

  return res.status(statusCode).json({
    message,
  });
});
