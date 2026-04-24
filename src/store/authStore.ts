let token = '';
let onAuthExpired: (() => void) | null = null;

export const getToken = () => token;

export const setToken = (value: string) => {
  token = value;
};

export const clearToken = () => {
  token = '';
};

export const setAuthExpiredHandler = (handler: (() => void) | null) => {
  onAuthExpired = handler;
};

export const notifyAuthExpired = () => {
  onAuthExpired?.();
};

// 内存级用户信息缓存
type UserInfo = {
  id: number;
  userName: string;
  avatar: string;
  signature: string;
};

let userInfo: UserInfo | null = null;

export const getUserInfo = () => userInfo;

export const setUserInfo = (info: UserInfo | null) => {
  userInfo = info;
};

export const clearUserInfo = () => {
  userInfo = null;
};
