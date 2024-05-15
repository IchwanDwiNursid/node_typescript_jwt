import { NextFunction, Request, Response } from "express";
import {
  LoginRequest,
  RegisterRequest,
  updateUserRequest,
} from "../model/userModel";
import { userService } from "../service/user.Service";
import { UserRequest } from "../type/user-request";

export class userController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RegisterRequest = req.body;
      const result = await userService.register(request);
      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  static async get(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.get();
      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginRequest = req.body;
      const result = await userService.login(request);

      res.cookie("refreshtoken", result.refresh_token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        access_token: result.access_token,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: updateUserRequest = req.body;
      const token: string = req.cookies.refreshtoken;
      request.token = token;
      const result = await userService.update(request, token);
      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: UserRequest, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshtoken"); // hapus cookie
      const token: string = req.cookies.refreshtoken;
      await userService.logout(token);
      res.status(200).json({
        message: "Logout Succesfully",
      });
    } catch (e) {
      next(e);
    }
  }
}
