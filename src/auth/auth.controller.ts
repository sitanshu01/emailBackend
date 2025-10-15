import express from "express";
import { signinSchema, signupSchema } from "../zod";
import { signin, signup } from "./auth.service";
import { prisma } from "../db";
import { signAccessToken } from "../util/token";

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const isValidInput = signupSchema.safeParse(req.body);
  if (!isValidInput.success) {
    const errorMessage =
      isValidInput.error?.issues?.[0]?.message ?? "Invalid input";

    return res.status(400).json({
      errorMessage,
    });
  }
  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    branch,
    rollNumber,
    role,
  } = isValidInput.data;
  const { status, requestId } = await signup(
    email,
    password,
    firstName,
    branch,
    rollNumber,
    role,
    lastName,
    middleName,
  );
  if (!status) {
    return res.status(400).json({
      message: "signup failed",
    });
  } else {
    res.cookie("requestId", requestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 60 * 5 * 1000, // 5 minutes in milliseconds
    });
    return res.status(200).json({
      message: "otp sent",
    });
  }
});

authRouter.post("/signin", async (req, res) => {
  const isValidInput = signinSchema.safeParse(req.body);
  if (!isValidInput.success) {
    const errorMessage =
      isValidInput.error?.issues?.[0]?.message ?? "Invalid input";

    return res.status(400).json({
      errorMessage,
    });
  }
  const { email, password, role } = isValidInput.data;
  const {
    error,
    msg,
    refreshToken,
    accessToken,
    statusCode: status,
  } = await signin(email, password, role);
  if (msg && refreshToken && accessToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 60* 15 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res.status(200).json({ message: "signin success" });
  } else {
    return res.status(status ?? 400).json({ error });
  }
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({
      message: "Missing refresh token",
    });
  }
  try {
    const found = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (!found) {
      return res.status(400).json({
        message: "Invalid refresh token",
      });
    }
    if (found.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Refresh token expired",
      });
    }

    const userId = found.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const accessToken = signAccessToken({
      userId,
      role: user.role.name,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1 * 1,
    });
    return res.status(200).json({
      message: "Refresh token refreshed",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong. Please try again later",
    });
  }
});
