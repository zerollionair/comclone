import {
  LoginUserRequest,
  RegisterUserRequest,
  ResetUserPassword,
  UpdateUserRequest,
  UserCurrent,
  UserResponse,
} from '../model/user-model';
import { UserValidation } from '../validation/user-validation';
import { prismaClient } from '../application/database';
import { HTTPException } from 'hono/http-exception';
import { Role, User } from '@prisma/client';
import { sign } from 'hono/jwt';

export class UserService {
  static async register(request: RegisterUserRequest): Promise<UserResponse> {
    request = UserValidation.REGISTER.parse(request);

    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        username: request.email,
      },
    });
    if (totalUserWithSameEmail != 0) {
      throw new HTTPException(400, {
        message: 'username already exists',
      });
    }
    request.password = await Bun.password.hash(request.password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    request.role = Role.CUSTOMER;

    await prismaClient.user.create({
      data: request,
    });

    return { message: 'successfully registered' };
  }
  static async login(request: LoginUserRequest): Promise<UserResponse> {
    request = UserValidation.LOGIN.parse(request);

    const user = await prismaClient.user.findUnique({
      where: {
        email: request.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
      },
    });
    if (!user) {
      throw new HTTPException(400, {
        message: 'email or password is wrong',
      });
    }
    const isPasswordValid = await Bun.password.verify(
      request.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HTTPException(400, {
        message: 'email or password is wrong',
      });
    }
    const accessSecret = Bun.env.JWTACCESSSECRET as string;
    const refreshSecret = Bun.env.JWTREFRESHSECRET as string;

    const accessToken = await sign(
      {
        id: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000 + 60 * 15),
      },
      accessSecret,
      'HS256',
    );

    const refreshToken = await sign(
      {
        id: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
      },
      refreshSecret,
      'HS256',
    );

    await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
    return {
      username: user.username,
      tokenAccess: accessToken,
      refreshToken: refreshToken,
    };
  }
  static async current(request: string): Promise<UserCurrent> {
    const user = await prismaClient.user.findUnique({
      where: {
        id: request,
      },
      select: {
        username: true,
        email: true,
        role: true,
      },
    });
    return user!;
  }
  static async update(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    request = UserValidation.UPDATE.parse(request);

    const updatedData: Partial<User> = {};

    if (request.username) {
      updatedData.username = request.username;
    }
    if (request.email) {
      updatedData.email = request.email;
    }

    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: updatedData,
    });
    return { message: 'updated successfully' };
  }
  static async resetPassword(
    userId: string,
    request: ResetUserPassword,
  ): Promise<UserResponse> {
    request = UserValidation.RESET_PASSWORD.parse(request);

    request.password = await Bun.password.hash(request.password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    const updatedData: Partial<User> = {};
    if (request.password) {
      updatedData.password = request.password;
    }
    await prismaClient.user.update({
      where: { id: userId },
      data: updatedData,
    });
    return { message: 'reset password successfully' };
  }
}
