export interface JwtDto {
  userId: string;
  role: string;

  iat: number;

  exp: number;
}
