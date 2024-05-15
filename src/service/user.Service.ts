import { number } from "zod";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/error";
import {
  LoginRequest,
  RegisterRequest,
  UpdateResponse,
  UserResponse,
  loginResponse,
  updateUserRequest,
} from "../model/userModel";
import { UserValidation } from "../validation/userValidation";
import { Validation } from "../validation/validation";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export class userService {
  static async register(request: RegisterRequest): Promise<UserResponse> {
    console.log(request);

    if (request.password !== request.confirmPassword) {
      throw new ResponseError(400, "Password Not Match");
    }

    const userRequest: RegisterRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    let user = await prismaClient.user.findFirst({
      where: {
        email: userRequest.email,
      },
    });

    if (user) {
      throw new ResponseError(400, "Email Alredy Exists");
    }

    user = await prismaClient.user.findFirst({
      where: {
        name: userRequest.name,
      },
    });

    if (user) {
      throw new ResponseError(400, "Name Alredy Exists");
    }

    user = await prismaClient.user.create({
      data: {
        name: userRequest.name,
        email: userRequest.email,
        password: await argon2.hash(userRequest.password),
      },
    });

    return {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  static async get(): Promise<UserResponse[]> {
    const user = await prismaClient.user.findMany();

    return user.map((value) => {
      return {
        id: value.id,
        name: value.name,
        email: value.email,
        password: value.password,
        createdAt: value.createdAt,
      };
    });
  }

  static async login(request: LoginRequest): Promise<loginResponse> {
    const userRequest = Validation.validate(UserValidation.LOGIN, request);

    let user = await prismaClient.user.findFirst({
      where: {
        email: userRequest.email,
      },
    });

    if (!user) {
      throw new ResponseError(401, "Email Or Password Wrong");
    }

    const passwordMatch = await argon2.verify(
      user.password,
      userRequest.password
    );

    if (!passwordMatch) {
      throw new ResponseError(401, "Email Or Password Wrong");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15s",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },

      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const token = await prismaClient.user.update({
      where: {
        email: user.email,
      },
      data: {
        refresh_token: refreshToken,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      refresh_token: refreshToken,
      access_token: accessToken,
    };
  }

  static async update(
    request: updateUserRequest,
    token: string
  ): Promise<UpdateResponse> {
    const userRequest = Validation.validate(UserValidation.UPDATE, request);

    if (!token) {
      throw new ResponseError(400, "Unauthorized");
    }

    request.token = token;

    const user = await prismaClient.user.findFirst({
      where: {
        refresh_token: token,
      },
    });

    if (!user) {
      throw new ResponseError(400, "Users Not Found Guys");
    }

    // ----------------- email and name can't same -------------------

    const getAllData = await userService.get();
    const name = getAllData.map((value) => value.name);
    const email = getAllData.map((value) => value.email);

    if (name.includes(userRequest.name)) {
      throw new ResponseError(400, "Name Alredy Exists");
    }
    if (email.includes(userRequest.email)) {
      throw new ResponseError(400, "Email Alredy Exists");
    }

    if (userRequest.password) {
      userRequest.password = await argon2.hash(userRequest.password);
    }

    const updateUser = await prismaClient.user.update({
      where: {
        email: user.email,
      },
      data: {
        name: userRequest.name,
        email: userRequest.email,
        password: userRequest.password,
      },
    });

    return {
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
      updatedAt: updateUser.updatedAt,
    };
  }

  static async logout(token: string): Promise<UserResponse> {
    if (!token) {
      throw new ResponseError(400, "Unauthorized");
    }

    const user = await prismaClient.user.findFirst({
      where: {
        refresh_token: token,
      },
    });

    if (!user) {
      throw new ResponseError(400, "Users Not Found Guys");
    }

    const updateUser = await prismaClient.user.update({
      where: {
        email: user.email,
      },
      data: {
        refresh_token: null,
      },
    });

    return updateUser;
  }
}
