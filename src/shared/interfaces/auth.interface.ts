export interface Payload {
  id: string;
  fullName: string;
  avatar: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload extends Payload {
  iat: number;
  exp: number;
}
