import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Schema } from "@/shared/interfaces";
import { roles, tokens, userRoles, users, UserSchema } from "@/domain/schema";
import { initAvatar } from "@/shared/helpers/avatar.helper";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  JwtPayload,
  Payload,
  TokenResponse,
} from "@/shared/interfaces/auth.interface";

import { RegisterRequest, RefreshToken } from "./dto";
import { Response } from "express";
import { addDays } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { DateHelper } from "@/shared/helpers/date.helper";
@Injectable()
export class AuthService {
  private secretKey: string;
  private refreshKey: string;
  private nodeEnv: string;
  private readonly SECRET_COOKIES = "Secret";
  private readonly REFRESH_COOKIES = "Refresh";

  constructor(
    @Inject("DATABASE_CONNECTION") private readonly database: Schema,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.secretKey = this.configService.get<string>("JWT_SECRET");
    this.refreshKey = this.configService.get<string>("JWT_REFRESH");
    this.nodeEnv = this.configService.get("NODE_ENV");
  }

  async findRoles(roleIds: string[]) {
    const existingRoles = await this.database
      .select({ name: roles.name })
      .from(roles)
      .where(inArray(roles.id, roleIds));

    const userRoles: string[] = existingRoles.map((role) => role.name);

    if (userRoles.length === 0) {
      throw new NotFoundException("No valid roles found!");
    }

    return userRoles;
  }

  async login(user: UserSchema, response: Response): Promise<TokenResponse> {
    const roleIds = user.roles.map((role) => role.roleId);

    const userRoles: string[] = await this.findRoles(roleIds);

    const token: TokenResponse = this.generateToken(user, userRoles);

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

      this.setCookies(token.accessToken, token.refreshToken, response);
      return token;
    } else {
      const payload = this.decodeSingleToken(
        existingRefreshToken.value,
        this.refreshKey,
      );

      if (payload.exp < DateHelper.currentTime()) {
        await this.database.update(tokens).set({
          value: token.refreshToken,
        });

        this.setCookies(token.accessToken, token.refreshToken, response);
        return token;
      } else {
        this.setCookies(
          token.accessToken,
          existingRefreshToken.value,
          response,
        );
        return {
          accessToken: token.accessToken,
          refreshToken: existingRefreshToken.value,
        };
      }
    }
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

  async refreshToken(
    refreshTokenRequest: RefreshToken,
  ): Promise<TokenResponse> {
    const payload = this.decodeSingleToken(
      refreshTokenRequest.token,
      this.refreshKey,
    );

    const existingAccount = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.id),
      with: {
        roles: true,
        tokens: true,
      },
    });

    if (!existingAccount) throw new UnauthorizedException();

    const token = await this.database
      .select({
        id: tokens.id,
        value: tokens.value,
      })
      .from(tokens)
      .where(
        and(eq(tokens.type, "REFRESH_TOKEN"), eq(tokens.userId, payload.id)),
      );

    if (!token || token.length === 0) throw new UnauthorizedException();

    const newToken = this.generateToken(existingAccount, payload.roles);

    if (payload.exp > DateHelper.currentTime()) {
      return {
        accessToken: newToken.accessToken,
        refreshToken: token[0].value,
      };
    } else {
      await this.database.update(tokens).set({
        value: newToken.refreshToken,
      });

      return newToken;
    }
  }

  async logout(user: UserSchema, response: Response) {
    const existingToken = await this.database
      .select({
        id: tokens.id,
      })
      .from(tokens)
      .where(and(eq(tokens.userId, user.id), eq(tokens.type, "REFRESH_TOKEN")))
      .limit(1);

    if (existingToken.length > 0) {
      await this.database
        .delete(tokens)
        .where(eq(tokens.id, existingToken[0].id));
    }

    response.clearCookie(this.REFRESH_COOKIES);
    response.clearCookie(this.SECRET_COOKIES);

    return {
      message: "Logout successfully!",
    };
  }

  private setCookies(
    accessToken: string,
    refreshToken: string,
    response: Response,
  ) {
    response.cookie(this.SECRET_COOKIES, accessToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      expires: addDays(new Date(), 7),
    });
    response.cookie(this.REFRESH_COOKIES, refreshToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      expires: addDays(new Date(), 7),
    });
  }

  private generateToken(user: UserSchema, roles: string[]): TokenResponse {
    const payload: Payload = {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      roles,
    };

    return {
      accessToken: this.generateSingleToken(payload, this.secretKey, "7d"),
      refreshToken: this.generateSingleToken(payload, this.refreshKey, "30d"),
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

  private decodeSingleToken(token: string, key: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: key,
    });
  }
}
