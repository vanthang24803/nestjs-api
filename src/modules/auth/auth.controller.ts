import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseAPIDocs, CurrentUser, Roles } from "@/common/decorators";
import BaseResponse from "@/shared/helpers/response.helper";
import { AuthService } from "./auth.service";
import { RefreshToken, RegisterRequest } from "./dto";
import { Response } from "express";

import { TokenResponse } from "@/shared/interfaces/auth.interface";
import { LocalAuthGuard } from "@/common/guards/local-auth.guard";
import { UserSchema } from "@/domain/schema";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Role } from "@/domain/enums";
import { RolesGuard } from "@/common/guards/roles.guard";

@Controller({
  path: "auth",
  version: "1",
})
@BaseAPIDocs()
@ApiTags("Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description:
      "Login successful. Returns user information and an authentication token.",
  })
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: UserSchema,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponse<TokenResponse>> {
    return new BaseResponse(200, await this.authService.login(user, response));
  }

  @Post("register")
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: "Register successfully. Returns string message.",
  })
  async register(
    @Body() registerRequest: RegisterRequest,
  ): Promise<BaseResponse<object>> {
    return new BaseResponse(
      201,
      await this.authService.register(registerRequest),
    );
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Refresh successfully. Returns token.",
  })
  async refreshToken(@Body() request: RefreshToken) {
    return new BaseResponse(200, await this.authService.refreshToken(request));
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiResponse({
    status: 200,
    description: "Logout successfully. Returns string message.",
  })
  async logout(
    @CurrentUser() user: UserSchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    return new BaseResponse(200, await this.authService.logout(user, response));
  }
}
