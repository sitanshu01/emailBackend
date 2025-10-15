import express, { type Request, type Response } from "express";
import { createAdminSchema, deleteAdminSchema } from "../zod";
import { createSuperAdmin, deleteSuperAdmin } from "./super_admin.service";
import { prisma } from "../db";

export const superAdminRouter = express.Router();

superAdminRouter.post("/create/admin", async (req: Request, res: Response) => {
  const isInputValid = createAdminSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      message: isInputValid.error.message,
    });
  }
  const { firstName, middleName, lastName, email, branch } = isInputValid.data;
  const { success, error, statusCode } = await createSuperAdmin(
    firstName,
    email,
    branch,
    middleName,
    lastName,
  );
  if (!success) {
    return res.status(statusCode).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "admin created successfully",
  });
});

superAdminRouter.get("/get/admins", async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: "ADMIN",
        },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email : true,
        branch : true,
        createdAt : true,
      }
    });
    return res.status(200).json({
      message: "success",
      data : admins,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong. Please try again later",
    });
  }
});

superAdminRouter.post("/delete/admin", async (req: Request, res: Response) => {
  const isInputValid = deleteAdminSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      message: isInputValid.error.message,
    });
  }
  const { email } = isInputValid.data;
  const { status, error } = await deleteSuperAdmin(email);
  if (!status) {
    return res.status(400).json({
      message: error,
    });
  }
  return res.status(200).json({
    message: "admin deleted successfully",
  });
});
