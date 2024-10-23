export interface Payload {
  id: string;
  fullName: string;
  avatar: string;
  roles: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
