import jwt from "jsonwebtoken";
import type { RoleType } from "../../generated/prisma";

interface PayloadInterface {
  userId: string;
  role: RoleType;
}

export function generateTokens(userId: string, role: RoleType) {
  const payload = {
    userId: userId,
    role: role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signAccessToken(payload);
  return { accessToken, refreshToken };
}

export function signAccessToken(payload: PayloadInterface) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: 60 * 60 * 1 * 1, // 1 hour
  });
}

export function signRefreshToken(payload: PayloadInterface) {
  return jwt.sign(payload, process.env.REFRESH_JWT_SECRET as string, {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
  });
}
