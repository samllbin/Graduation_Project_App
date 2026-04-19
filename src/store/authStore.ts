let token = '';

export const getToken = () => token;

export const setToken = (value: string) => {
  token = value;
};

export const clearToken = () => {
  token = '';
};
