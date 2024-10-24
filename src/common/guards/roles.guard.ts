import { Role } from "@/domain/enums";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AuthService } from "@/modules/auth/auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRoleIds = user.roles.map(
      (role: { roleId: string }) => role.roleId,
    );

    const userRoles = await this.authService.findRoles(userRoleIds);

    return roles.some((role) => userRoles.includes(role));
  }
}
