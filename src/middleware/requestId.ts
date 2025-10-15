import "express";
import type { NextFunction, Request, Response } from "express";

export const decodeRequestId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.cookies?.requestId;

  if (!requestId) {
    return res.status(400).json({ error: "Missing requestId cookie" });
  }

  req.requestId = requestId;
  next();
};
