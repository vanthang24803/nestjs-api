import { Inject, Injectable } from "@nestjs/common";
import { LoginRequest } from "./dto/login.request";
import { RegisterRequest } from "./dto/register.request";
import * as bcrypt from "bcrypt";
import { Schema } from "@/shared/interfaces";
import { users } from "@/schema";
import { initAvatar } from "@/shared/helpers/avatar.helper";

@Injectable()
export class AuthService {
  constructor(
    @Inject("DATABASE_CONNECTION") private readonly database: Schema,
  ) {}

  async login(loginRequest: LoginRequest) {
    return loginRequest;
  }

  async register(registerRequest: RegisterRequest) {
    await this.database.insert(users).values({
      ...registerRequest,
      avatar: initAvatar(
        `${registerRequest.firstName} ${registerRequest.lastName}`,
      ),
      password: await bcrypt.hash(registerRequest.password, 10),
    });

    return {
      message: "Register successfully!",
    };
  }
}
