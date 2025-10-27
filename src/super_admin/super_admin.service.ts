import argon2 from "argon2";
import { type Branch } from "../../generated/prisma";
import logger from "../config/logger";
import { prisma } from "../db";
import { sendEmail } from "../email";
import generatePassword from "./generate_password";

export const createAdmin = async (
  firstName: string,
  email: string,
  branch: Branch,
  middleName?: string,
  lastName?: string,
) => {
  const password = generatePassword(12);
  const hashedPassword = await argon2.hash(password);
  try {
    const emailSent = await sendEmail(
      email,
      `Password: ${password}`,
      "Password",
    );
    await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        branch,
        emailVerified: true,
        role: {
          connect: {
            name: "ADMIN",
          },
        },
        password: hashedPassword,
      },
    });
    if (!emailSent.success) {
      return { success: false, error: emailSent.error, statusCode: 500 };
    }
    return { success: true, statusCode: 200 };
  } catch (error) {
    logger.error(error);
    return { success: false, error: "User already exists", statusCode: 500 };
  }
};

export const deleteAdmin = async (id: string) => {
  try {
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });
    return { status: true, data: user };
  } catch (error) {
    logger.error(error);
    return { status: false, error: "User does not exist" };
  }
};
