import {
  ApiResponse,
  LoginReq,
  LoginRes,
  RegisterReq,
  ResetPasswordReq,
  SendForgotCodeReq,
  SendRegisterCodeReq,
} from '../types/auth';
import { http } from './http';

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<ApiResponse<T>>;

export const loginApi = (params: LoginReq) =>
  asApiResponse<LoginRes>(http.post('/auth/login', params));

export const refreshTokenApi = (refreshToken: string) =>
  asApiResponse<{ access_token: string }>(
    http.post('/auth/refresh', {
      refresh_token: refreshToken,
    }),
  );

export const logoutApi = () => asApiResponse<null>(http.post('/auth/logout'));

export const registerApi = (params: RegisterReq) =>
  asApiResponse<null>(http.post('/user/create', params));

export const sendRegisterCodeApi = (params: SendRegisterCodeReq) =>
  asApiResponse<null>(http.post('/email/send-code', params));

export const sendForgotCodeApi = (params: SendForgotCodeReq) =>
  asApiResponse<null>(http.post('/user/password/forgot/send-code', params));

export const resetForgotPasswordApi = (params: ResetPasswordReq) =>
  asApiResponse<null>(http.patch('/user/password/forgot/reset', params));
