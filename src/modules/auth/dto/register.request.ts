import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
  MaxLength,
} from "class-validator";

export class RegisterRequest {
  @ApiProperty({
    example: "May",
    description: "The first name of the user",
  })
  @IsString()
  @MinLength(2, {
    message: "First name must be at least 2 characters long.",
  })
  @MaxLength(256, {
    message: "First name cannot exceed 256 characters.",
  })
  firstName: string;

  @ApiProperty({
    example: "May",
    description: "The last name of the user",
  })
  @IsString()
  @MinLength(2, {
    message: "Last name must be at least 2 characters long.",
  })
  @MaxLength(256, {
    message: "Last name cannot exceed 256 characters.",
  })
  lastName: string;

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
