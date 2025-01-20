import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginInputDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  password: string;
}
