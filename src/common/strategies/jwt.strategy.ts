import { Request } from "express";
import { AuthService } from "@/modules/auth/auth.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Payload } from "@/shared/interfaces/auth.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Secret,
      ]),
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: Payload) {
    return this.authService.validateUser(payload.id);
  }
}
