import argon from "argon2";
import { Branch, RoleType } from "../../generated/prisma";
import { prisma } from "../db";
import { setOTP } from "../otp/otp.service";
import { generateTokens } from "../util/token";

export const signup = async (
  email: string,
  password: string,
  firstName: string,
  branch: Branch,
  rollNumber: string,
  role: RoleType,
  lastName?: string,
  middleName?: string,
) => {
  if (role !== "STUDENT") {
    return { status: false, error: "Only students can signup" };
  }
  const hashedPassword = await argon.hash(password);
  const userData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    rollNumber,
    middleName,
    branch: branch,
    roleName: role,
  };
  const { success: status, requestId } = await setOTP(email, userData);
  if (!status) {
    return { status };
  }

  return { status, requestId };
};

export const signin = async (
  email: string,
  password: string,
  role: RoleType,
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: {
          name: role,
        },
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!user) {
      return { error: "Invalid Credentials", statusCode: 400, success: false };
    }

    if (user.emailVerified === false) {
      return { error: "Email not verified", status: 400, success: false };
    }

    const isPasswordCorrect = await argon.verify(user.password, password);
    if (!isPasswordCorrect) {
      return { error: "Invalid Credentials", status: 400, success: false };
    }

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.role.name,
    );

    // Delete existing refresh token if it exists, then create a new one
    await prisma.refreshToken.upsert({
      where: {
        userId: user.id,
      },
      update: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7), // 7 days
      },
      create: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7), // 7 days
      },
    });

    return {
      msg: "Sign in successful",
      status: 200,
      success: true,
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Something went wrong. Please try again later",
      status: 500,
    };
  }
};

export const refresh = async (refreshToken: string) => {};
