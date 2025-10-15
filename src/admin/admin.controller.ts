import express, {type Request,type Response } from "express";
import {
    createForm,
    updateForm,
    deleteForm,
    publishForm,
    unpublishForm,
    getSubmissions,
    getForm,
    getForms,
} from "./admin.services";
import { createFormSchema } from "../zod";

export const adminRouter = express.Router();

// Create form
// adminRouter.post("/create/form", async (req: Request, res: Response) => {
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   // Validate request body
//   const validation = createFormSchema.safeParse(req.body);
//   if (!validation.success) {
//     // Return detailed Zod errors instead of generic message
//     return res.status(400).json({
//       message: "Validation failed",
//       errors: validation.error.issues.map((err) => ({
//         path: err.path.join("."),
//         message: err.message,
//         data:"damn man its not working"
//       })),
//     });
//   }

//   const { formName, questions } = validation.data;

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
//     console.error("Error creating form:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

adminRouter.post("/create/form", async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({ message: "Unauthorized" });

  // Validate request body
  const validation = createFormSchema.safeParse(req.body);
  if (!validation.success) {
    return res
      .status(400)
      .json({ message: validation.error.format() });
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
adminRouter.get('/forms', async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const result = await getForms(userId);
  return result.success
    ? res.json({ message: "Forms fetched successfully", data: result.data })
    : res.status(400).json({ message: result.error });
    //
})

//get form
adminRouter.get('/form/:formId', async (req: Request, res: Response) => {
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
  if(!formId || typeof formId !== "string" || formId.trim() === ""){
    return res.status(400).json({ message: "Missing or invalid formId" });
  }

  const result = await deleteForm(formId, userId);

  return result.success
    ? res.json({ message: "Form deleted successfully" })
    : res.status(400).json({ message: result.error });
});

//  Publish form
adminRouter.put("/form/publish/:formId", async (req: Request, res: Response) => {
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
});

//  Unpublish form
adminRouter.put("/form/unpublish/:formId", async (req: Request, res: Response) => {
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
});

//  Get submissions (with optional ?branch=filter)
adminRouter.get("/submissions/:formId", async (req: Request, res: Response) => {
  const userId = req.userId;
  const { formId } = req.params;
  const { branch } = req.query;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!formId || typeof formId !== "string" || formId.trim() === "") {
    return res.status(400).json({ message: "Missing or invalid formId" });
  }

  const result = await getSubmissions(formId, userId, branch as string | undefined);

  return result.success
    ? res.json({ message: "Submissions fetched successfully", data: result.data })
    : res.status(400).json({ message: result.error });
});
