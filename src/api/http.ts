import axios from 'axios';
import {clearToken, getToken} from '../store/authStore';
import {AppError} from '../types/http';

export const createHttpClient = () => {
  const client = axios.create({
    baseURL: 'http://10.0.2.2:3000',
    timeout: 10000,
    headers: {'Content-Type': 'application/json'},
  });

  client.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    response => {
      const data = response.data;
      if (
        typeof data?.code === 'number' &&
        data.code !== 200 &&
        data.code !== 201
      ) {
        return Promise.reject({
          message: data.message || '请求失败',
          code: data.code,
        } as AppError);
      }
      return data;
    },
    error => {
      const status = error?.response?.status as number | undefined;
      if (status === 401) {
        clearToken();
      }
      return Promise.reject({
        message: error?.response?.data?.message || error.message || '网络错误',
        status,
      } as AppError);
    },
  );

  return client;
};

export const http = createHttpClient();
