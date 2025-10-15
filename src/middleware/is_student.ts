import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { STUDENT } from "../config";

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const decoded = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string,
  ) as JwtPayload;
  const { userId, role } = decoded;
  if (role !== STUDENT) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  req.role = role;

  next();
};
