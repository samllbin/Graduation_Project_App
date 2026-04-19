export type ApiResponse<T> = {
  code: number;
  message: string;
  data?: T;
};

export type LoginReq = { login: string; password: string };

export type LoginRes = {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    userName: string;
    avatar: string;
    signature: string;
  };
};

export type RegisterReq = {
  userName: string;
  email: string;
  code: string;
  password: string;
};

export type SendRegisterCodeReq = { email: string };

export type SendForgotCodeReq = { login: string };

export type ResetPasswordReq = {
  login: string;
  code: string;
  newPassword: string;
};
