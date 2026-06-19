export interface JwtAccessPayload {
  sub: string;
  role: string;
  email: string | null;
}
