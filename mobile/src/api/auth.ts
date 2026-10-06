import { apiClient } from './client';

export type Provider = 'LOCAL' | 'GOOGLE';

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
};

export type Session = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user?: SessionUser;
};

export type Me = SessionUser & {
  emailVerified: boolean;
  hasPassword: boolean;
  providers: Provider[];
};

export type MessageResponse = { message: string };

export const register = (body: { email: string; password: string; displayName: string }) =>
  apiClient.post<MessageResponse>('/auth/register', body).then((response) => response.data);

export const login = (body: { email: string; password: string }) =>
  apiClient.post<Session>('/auth/login', body).then((response) => response.data);

export const refresh = (body: { refreshToken: string }) =>
  apiClient.post<Session>('/auth/refresh', body).then((response) => response.data);

export const me = () =>
  apiClient.get<Me>('/auth/me').then((response) => response.data);

export const resendVerification = (body: { email: string }) =>
  apiClient.post<MessageResponse>('/auth/verify/resend', body).then((response) => response.data);

export const forgotPassword = (body: { email: string }) =>
  apiClient.post<MessageResponse>('/auth/password/forgot', body).then((response) => response.data);

export const resetPassword = (body: { email: string; code: string; newPassword: string }) =>
  apiClient.post<MessageResponse>('/auth/password/reset', body).then((response) => response.data);

export const logout = (body: { refreshToken: string }) =>
  apiClient.post<void>('/auth/logout', body).then(() => undefined);

export const logoutAll = () =>
  apiClient.post<void>('/auth/logout-all').then(() => undefined);

export const googleSignIn = (body: { idToken: string }) =>
  apiClient.post<Session>('/auth/google', body).then((response) => response.data);

export const linkGoogle = (body: { idToken: string }) =>
  apiClient.post<Me>('/auth/link/google', body).then((response) => response.data);

export const unlinkGoogle = () =>
  apiClient.delete<Me>('/auth/link/google').then((response) => response.data);
