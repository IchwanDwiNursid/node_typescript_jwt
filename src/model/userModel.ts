export class RegisterRequest {
  name!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;
}

export class UserResponse {
  id?: number;
  name!: string;
  email!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class loginResponse {
  id?: number;
  name!: string;
  email!: string;
  refresh_token!: string;
  access_token!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LoginRequest {
  name!: string;
  password!: string;
}

export type updateUserRequest = {
  name?: string;
  email?: string;
  password?: string;
  token: string;
};

export type UpdateResponse = {
  id: number;
  name: string;
  email: string;
  updatedAt?: Date;
};
