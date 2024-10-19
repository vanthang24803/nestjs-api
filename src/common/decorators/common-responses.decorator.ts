import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export function BaseAPIDocs() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: "User is unauthorized or token is invalid.",
    }),
    ApiResponse({
      status: 403,
      description:
        "Access forbidden. You do not have permission to access this resource.",
    }),
    ApiResponse({
      status: 500,
      description: "Internal server error. Please try again later.",
    }),
  );
}
