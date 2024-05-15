import e, { NextFunction, Response, Request } from "express";
import { ResponseError } from "../error/error";
import { ZodError } from "zod";

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ResponseError) {
    return res.status(error.status).json({
      errors: error.message,
    });
  } else if (error instanceof ZodError) {
    return res.status(400).json({
      errors: error.issues[0].message,
    });
  } else {
    return res.status(500).json({
      errors: "Internal Server Error",
    });
  }
};
