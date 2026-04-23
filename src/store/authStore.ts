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
