export interface AuthUserDto {
  id: string;
  email: string | undefined;
  name: string;
  role: string;
}

export interface AuthLoginResultDto {
  user: AuthUserDto;
  session: unknown;
}
