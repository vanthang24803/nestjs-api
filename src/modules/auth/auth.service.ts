import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Schema } from "@/shared/interfaces";
import { tokens, userRoles, users, UserSchema } from "@/domain/schema";
import { initAvatar } from "@/shared/helpers/avatar.helper";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Payload, TokenResponse } from "@/shared/interfaces/auth.interface";

import { RegisterRequest, RefreshToken } from "./dto";
import { Response } from "express";
import { addDays } from "date-fns";
@Injectable()
export class AuthService {
  private jwtSecret: string;
  private jwtRefresh: string;
  private nodeEnv: string;

  constructor(
    @Inject("DATABASE_CONNECTION") private readonly database: Schema,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>("JWT_SECRET");
    this.jwtRefresh = this.configService.get<string>("JWT_REFRESH");
    this.nodeEnv = this.configService.get("NODE_ENV");
  }

  async login(user: UserSchema, response: Response): Promise<TokenResponse> {
    const token: TokenResponse = this.generateToken(user);

    const existingRefreshToken = await this.database.query.tokens.findFirst({
      where: (tokens, { and, eq }) =>
        and(eq(tokens.type, "REFRESH_TOKEN"), eq(tokens.userId, user.id)),
    });

    if (!existingRefreshToken) {
      await this.database.insert(tokens).values({
        type: "REFRESH_TOKEN",
        userId: user.id,
        value: token.refreshToken,
      });
    }

    existingRefreshToken.value = token.refreshToken;

    await this.database.update(tokens).set({
      value: token.refreshToken,
    });

    response.cookie("Secret", token.accessToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      expires: addDays(new Date(), 7),
    });
    response.cookie("Refresh", token.refreshToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      expires: addDays(new Date(), 7),
    });

    return token;
  }

  async register(registerRequest: RegisterRequest): Promise<object> {
    const isExistingEmail = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, registerRequest.email),
    });

    if (isExistingEmail) throw new BadRequestException("Email existed");

    const customerRole = await this.database.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.name, "CUSTOMER"),
    });

    if (!customerRole) throw new NotFoundException("Customer role not found!");

    const [newAccount] = await this.database
      .insert(users)
      .values({
        ...registerRequest,
        avatar: initAvatar(
          `${registerRequest.firstName} ${registerRequest.lastName}`,
        ),
        password: await bcrypt.hash(registerRequest.password, 10),
      })
      .returning();

    await this.database.insert(userRoles).values({
      roleId: customerRole.id,
      userId: newAccount.id,
    });

    return {
      message: "Register successfully!",
    };
  }

  async validateUser(id: string): Promise<UserSchema> {
    const existingAccount = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      with: {
        roles: true,
        tokens: true,
      },
    });

    if (!existingAccount) throw new UnauthorizedException();

    console.log(existingAccount);

    return existingAccount;
  }

  async verifyUser(email: string, password: string): Promise<UserSchema> {
    const existingAccount = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
      with: {
        roles: true,
        tokens: true,
      },
    });

    if (!existingAccount) throw new BadRequestException("Account not found");

    const isMatchPassword = await bcrypt.compare(
      password,
      existingAccount.password,
    );

    if (!isMatchPassword)
      throw new BadRequestException("Email or password wrong!");

    return existingAccount;
  }

  async refreshToken(refreshTokenRequest: RefreshToken) {
    return refreshTokenRequest;
  }

  private generateToken(user: UserSchema): TokenResponse {
    const payload: Payload = {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      roles: ["Admin", "Manager", "User"],
    };

    return {
      accessToken: this.generateSingleToken(payload, this.jwtSecret, "7d"),
      refreshToken: this.generateSingleToken(payload, this.jwtRefresh, "30d"),
    };
  }

  private generateSingleToken(
    payload: Payload,
    key: string,
    expiresIn: string | number,
  ): string {
    return this.jwtService.sign(payload, {
      secret: key,
      expiresIn,
    });
  }

  private decodeSingleToken(token: string, key: string): Payload {
    return this.jwtService.verify(token, {
      secret: key,
    });
  }
}
