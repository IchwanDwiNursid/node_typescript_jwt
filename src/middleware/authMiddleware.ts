import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserRequest } from "../type/user-request";
dotenv.config();
import { prismaClient } from "../application/database";
export const authMiddleware = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      errors: "Unauthorized",
    });
  }

  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    next();
  } catch (error) {
    res.status(401).json({
      errors: "Unauthorized",
    });
  }
};

export const refreshToken = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshtoken;

  if (!refreshToken) {
    return res.status(401).json({
      errors: "Unauthorized",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user) {
    return res.status(403).json({
      errors: "Forbiden",
    });
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "20s",
      }
    );

    res.json({
      access_token: accessToken,
    });

    next();
  } catch (error) {
    res.status(401).json({
      errors: error,
    });
  }
};
