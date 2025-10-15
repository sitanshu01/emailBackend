import argon2 from "argon2";
import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

const EXPIRY_SECONDS = 300; // 5 minutes

export async function storeOTP(
  email: string,
  otp: string,
  user: any,
  requestId: string,
) {
  try {
    const hashedOtp = await argon2.hash(otp);
    await redis.set(
      `otp:${email}:${requestId}`,
      hashedOtp,
      "EX",
      EXPIRY_SECONDS,
    );
    await redis.set(
      `user:${email}:${requestId}`,
      JSON.stringify(user),
      "EX",
      EXPIRY_SECONDS,
    );
    return true;
  } catch (err) {
    console.error("Failed to store OTP:", err);
    return false;
  }
}

export async function verifyOTP(
  email: string,
  inputOtp: string,
  requestId: string,
) {
  try {
    const storedHashedOtp = await redis.get(`otp:${email}:${requestId}`);
    if (!storedHashedOtp) return false;

    const isValid = await argon2.verify(storedHashedOtp, inputOtp);
    if (!isValid) return false;

    return true;
  } catch (err) {
    console.error("Failed to verify OTP:", err);
    return false;
  }
}

export const getUserDataStr = async (email: string, requestId: string) => {
  try {
    const userDataStr = await redis.get(`user:${email}:${requestId}`);
    return userDataStr;
  } catch (err) {
    console.error("Failed to get user data:", err);
    return null;
  }
};

export const deleteOTP = async (email: string, requestId: string) => {
  try {
    await redis.del(`otp:${email}:${requestId}`);
    return true;
  } catch (err) {
    console.error("Failed to delete OTP:", err);
    return false;
  }
};

export const deleteUserData = async (email: string, requestId: string) => {
  try {
    await redis.del(`user:${email}:${requestId}`);
    return true;
  } catch (err) {
    console.error("Failed to delete user data:", err);
    return false;
  }
};

export const deleteOTPAndUserData = async (
  email: string,
  requestId: string,
) => {
  try {
    await Promise.all([
      deleteOTP(email, requestId),
      deleteUserData(email, requestId),
    ]);
    return true;
  } catch (err) {
    console.error("Failed to delete OTP and user data:", err);
    return false;
  }
};
