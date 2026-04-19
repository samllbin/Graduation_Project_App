import {
  ApiResponse,
  LoginReq,
  LoginRes,
  RegisterReq,
  ResetPasswordReq,
  SendForgotCodeReq,
  SendRegisterCodeReq,
} from '../types/auth';
import {http} from './http';

export const loginApi = (params: LoginReq) =>
  http.post<ApiResponse<LoginRes>>('/auth/login', params);

export const registerApi = (params: RegisterReq) =>
  http.post<ApiResponse<null>>('/user/create', params);

export const sendRegisterCodeApi = (params: SendRegisterCodeReq) =>
  http.post<ApiResponse<null>>('/email/send-code', params);

export const sendForgotCodeApi = (params: SendForgotCodeReq) =>
  http.post<ApiResponse<null>>('/user/password/forgot/send-code', params);

export const resetForgotPasswordApi = (params: ResetPasswordReq) =>
  http.patch<ApiResponse<null>>('/user/password/forgot/reset', params);
