import express, { type Request, type Response } from "express";
import { Status } from "../../generated/prisma";
import { createFormSchema } from "../zod";
import {
  createForm,
  deleteForm,
  getForm,
  getForms,
  getSubmissions,
  publishForm,
  unpublishForm,
  updateForm,
  updateSubmissionStatus,
  getAdminDashboardSummary,
} from "./admin.services";
const adminRouter = express.Router();

//   try {
//     // Call service layer
//     const result = await createForm(userId, formName, questions);

//     if (result.success) {
//       return res.status(201).json({
//         message: "Form created successfully",
//         data: result.data,
//       });
//     }

//     return res.status(400).json({ message: result.error });
//   } catch (error) {
//     logger.error("Error creating form:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

adminRouter.post("/form", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // Validate request body
  const validation = createFormSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: validation.error });
  }

  const { formName, questions } = validation.data;

  // Call service
  const result = await createForm(userId, formName, questions);

  if (!result.success) {
    return res.status(500).json({ message: result.error });
  }

  return res.status(201).json({
    message: "Form created successfully",
    data: result.data,
  });
});

//get All forms
adminRouter.get("/form", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const result = await getForms(userId);
  return result.success
    ? res.json({ message: "Forms fetched successfully", data: result.data })
    : res.status(400).json({ message: result.error });
  //
});

//get form
adminRouter.get("/form/:formId", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { formId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!formId || typeof formId !== "string" || formId.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid formId" });
  }
  const result = await getForm(formId, userId);
  return result.success
    ? res.json({ message: "Form fetched successfully", data: result.data })
    : res.status(400).json({ message: result.error });
});

//  Update form
adminRouter.put("/update/form/:formId", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { formId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!formId || typeof formId !== "string" || formId.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid formId" });
  }

  const validation = createFormSchema.safeParse(req.body);
  if (!validation.success)
    return res.status(400).json({ message: validation.error.message });

  const { formName, questions } = validation.data;
  const result = await updateForm(formId, userId, formName, questions);

  return result.success
    ? res.json({ message: "Form updated successfully" })
    : res.status(400).json({ message: result.error });
});

//  Delete form
adminRouter.delete("/form/:formId", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { formId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!formId || typeof formId !== "string" || formId.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid formId" });
  }

  const result = await deleteForm(formId, userId);

  return result.success
    ? res.json({ message: "Form deleted successfully" })
    : res.status(400).json({ message: result.error });
});

//  Publish form (generate shareId)
adminRouter.put(
  "/form/publish/:formId",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const { formId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!formId || typeof formId !== "string" || formId.trim() === "") {
      return res.status(400).json({ message: "Missing or invalid formId" });
    }

    const result = await publishForm(formId, userId);
    return result.success
      ? res.json({ message: "Form published successfully", data: result.data })
      : res.status(400).json({ message: result.error });
  },
);

//  Unpublish form
adminRouter.put(
  "/form/unpublish/:formId",
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const { formId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!formId || typeof formId !== "string" || formId.trim() === "") {
      return res.status(400).json({ message: "Missing or invalid formId" });
    }

    const result = await unpublishForm(formId, userId);
    return result.success
      ? res.json({ message: "Form unpublished successfully" })
      : res.status(400).json({ message: result.error });
  },
);

//  Get submissions (with optional ?branch=filter)
adminRouter.get("/submissions/:formId", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { formId } = req.params;
  const { branch } = req.query;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!formId || typeof formId !== "string" || formId.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid formId" });
  }

  const result = await getSubmissions(
    formId,
    userId,
    branch as string | undefined,
  );

  return result.success
    ? res.json({
        message: "Submissions fetched successfully",
        data: result.data,
      })
    : res.status(400).json({ message: result.error });
});

// Update submission status
adminRouter.patch(
  "/submissions/:submissionId/status",
  async (req: Request, res: Response) => {
    const adminUserId = req.userId; // Assuming req.userId is the admin's ID
    const { submissionId } = req.params;
    const { status } = req.body; // status should be 'APPROVED', 'REJECTED', or 'PENDING'

    if (!adminUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (
      !submissionId ||
      typeof submissionId !== "string" ||
      submissionId.trim() === ""
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid submissionId" });
    }
    if (!status || !Object.values(Status).includes(status)) {
      // Validate status against the Status enum
      return res.status(400).json({ message: "Missing or invalid status" });
    }

    const result = await updateSubmissionStatus(
      submissionId,
      adminUserId,
      status,
    );

    if (result.success) {
      return res.json({
        message: "Submission status updated successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({ message: result.error });
    }
  },
);

// to cahnge the status
adminRouter.post("/student/:studendID", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { studentID } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!studentID || typeof studentID !== "string" || studentID.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid studentID" });
  }
});

// Get admin dashboard summary
adminRouter.get("/dashboard/summary", async (req: Request, res: Response) => {
  const adminUserId = req.userId;
  if (!adminUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await getAdminDashboardSummary(adminUserId);

  if (result.success) {
    return res.json({
      message: "Admin dashboard summary fetched successfully",
      data: result.data,
    });
  } else {
    return res.status(500).json({ message: result.error });
  }
});

export { adminRouter };

