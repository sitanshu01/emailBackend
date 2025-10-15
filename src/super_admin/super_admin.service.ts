import argon2 from "argon2";
import { type Branch } from "../../generated/prisma";
import { prisma } from "../db";
import { sendEmail } from "../email";
import generatePassword from "./generate_password";

export const createSuperAdmin = async (
  firstName: string,
  email: string,
  branch: Branch,
  middleName?: string,
  lastName?: string,
) => {
  // const password = Math.random().toString(36).substring(2, 15);
  const password = generatePassword(12);
  const hashedPassword = await argon2.hash(password);
  try {
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

    const emailSent = await sendEmail(email, `Password: ${password}`);
    if (!emailSent.success) {
      return { success: false, error: emailSent.error, statusCode: 500 };
    }
    return { success: true, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, error: "User already exists", statusCode: 500 };
  }
};

export const deleteSuperAdmin = async (email: string) => {
  try {
    const user = await prisma.user.delete({
      where: {
        email,
      },
    });
    return { status: true, data: user };
  } catch (error) {
    console.log(error);
    return { status: false, error: "User does not exist" };
  }
};
