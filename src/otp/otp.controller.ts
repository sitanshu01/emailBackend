import express from "express";
import { prisma } from "../db";
import { deleteOTPAndUserData, getUserDataStr, verifyOTP } from "../redis";
import { verifyOTPSchema } from "../zod";
export const otpRouter = express.Router();

otpRouter.post("/verify_otp", async (req, res) => {
  const requestId = req.requestId;
  if (!requestId) {
    return res.status(400).json({
      message: "Missing requestId",
    });
  }
  const isInputValid = verifyOTPSchema.safeParse(req.body);
  if (!isInputValid.success) {
    const errorMessage =
      isInputValid.error?.issues?.[0]?.message ?? "Invalid input";

    return res.status(400).json({
      errorMessage,
    });
  }
  const { email, otp } = isInputValid.data;
  const validOTP = await verifyOTP(email, otp, requestId);
  if (!validOTP) {
    return res.status(400).json({
      message: "OTP is invalid",
    });
  }

  const userDataStr = await getUserDataStr(email, requestId);
  if (!userDataStr) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const userData = JSON.parse(userDataStr);

  await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      rollNumber: userData.rollNumber,
      branch: userData.branch,
      role: {
        connect: { name: userData.roleName },
      },
      emailVerified: true,
    },
  });

  await deleteOTPAndUserData(email, requestId);

  return res.status(200).json({
    status: "OTP verified",
  });
});
