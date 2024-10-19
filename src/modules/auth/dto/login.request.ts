import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class LoginRequest {
  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
  })
  @IsEmail(
    {},
    {
      message: "Invalid email format. Please enter a valid email address.",
    },
  )
  email: string;

  @ApiProperty({
    example: "StrongPassword123!",
    description: "The password of the user",
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must have at least 8 characters, including uppercase, lowercase, numbers, and symbols.",
    },
  )
  password: string;
}
