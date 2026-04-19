export const validateLoginInput = (login: string, password: string) => {
  if (!login.trim()) return '请输入账号';
  if (!password) return '请输入密码';
  return '';
};

export const validateRegisterInput = (data: {
  userName: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}) => {
  if (!data.userName.trim()) return '请输入用户名';
  if (!data.email.trim()) return '请输入邮箱';
  if (!data.code.trim()) return '请输入验证码';
  if (!data.password) return '请输入密码';
  if (data.password !== data.confirmPassword) return '两次密码不一致';
  return '';
};

export const validateForgotInput = (data: {
  login: string;
  code: string;
  newPassword: string;
}) => {
  if (!data.login.trim()) return '请输入账号或邮箱';
  if (!data.code.trim()) return '请输入验证码';
  if (!data.newPassword) return '请输入新密码';
  return '';
};
