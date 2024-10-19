import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseAPIDocs } from "@/common/decorators";
import BaseResponse from "@/shared/helpers/response.helper";
import { AuthService } from "./auth.service";
import { LoginRequest, RegisterRequest } from "./dto";

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
  login(@Body() loginRequest: LoginRequest) {
    return new BaseResponse(200, this.authService.login(loginRequest));
  }

  @Post("register")
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: "Register successfully. Returns string message.",
  })
  async register(@Body() registerRequest: RegisterRequest) {
    return new BaseResponse(
      201,
      await this.authService.register(registerRequest),
    );
  }
}
