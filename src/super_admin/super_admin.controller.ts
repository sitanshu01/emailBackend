import logger from "../config/logger";
import express, { type Request, type Response } from "express";
import { prisma } from "../db";
import { createAdminSchema } from "../zod";
import { createAdmin, deleteAdmin } from "./super_admin.service";

export const superAdminRouter = express.Router();

superAdminRouter.post("/admin", async (req: Request, res: Response) => {
  const isInputValid = createAdminSchema.safeParse(req.body);
  if (!isInputValid.success) {
    return res.status(400).json({
      message: isInputValid.error.message,
    });
  }
  const { firstName, middleName, lastName, email, branch } = isInputValid.data;
  const { success, error, statusCode } = await createAdmin(
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

superAdminRouter.get("/admin", async (req: Request, res: Response) => {
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
        email: true,
        branch: true,
        createdAt: true,
      },
    });
    return res.status(200).json({
      message: "success",
      data: admins,
    });
  } catch (error) {
          logger.error(error);    return res.status(500).json({
      message: "Something went wrong. Please try again later",
    });
  }
});

superAdminRouter.delete(
  "/admin/:adminId",
  async (req: Request, res: Response) => {
    const { adminId } = req.params;
    if (!adminId) {
      return res.status(400).json({
        message: "adminId is required",
      });
    }
    const { status, error } = await deleteAdmin(adminId);
    if (!status) {
      return res.status(400).json({
        message: error,
      });
    }
    return res.status(200).json({
      message: "admin deleted successfully",
    });
  },
);
