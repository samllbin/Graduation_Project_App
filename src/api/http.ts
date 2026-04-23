import axios, {AxiosRequestConfig} from 'axios';
import {
  clearToken,
  getToken,
  notifyAuthExpired,
  setToken,
} from '../store/authStore';
import {
  clearSession,
  getOrCreateDeviceId,
  getStoredRefreshToken,
  updateAccessToken,
} from '../store/authSession';
import {AppError} from '../types/http';

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

const BASE_URL = 'http://10.0.2.2:3000';

let refreshingPromise: Promise<string> | null = null;

const clearAuthState = async () => {
  clearToken();
  await clearSession();
  notifyAuthExpired();
};

const requestRefreshToken = async (refreshToken: string): Promise<string> => {
  const deviceId = await getOrCreateDeviceId();
  const response = await axios.post(
    `${BASE_URL}/auth/refresh`,
    {refresh_token: refreshToken},
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      },
    },
  );

  const data = response.data;
  if (typeof data?.code === 'number' && data.code !== 200 && data.code !== 201) {
    throw new Error(data?.message || '刷新登录状态失败');
  }

  const nextAccessToken = data?.data?.access_token || '';
  if (!nextAccessToken) {
    throw new Error(data?.message || '刷新登录状态失败');
  }

  return nextAccessToken;
};

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('缺少刷新令牌');
      }

      const nextAccessToken = await requestRefreshToken(refreshToken);
      setToken(nextAccessToken);
      await updateAccessToken(nextAccessToken);
      return nextAccessToken;
    })().finally(() => {
      refreshingPromise = null;
    });
  }

  return refreshingPromise;
};

export const createHttpClient = () => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {'Content-Type': 'application/json'},
  });

  client.interceptors.request.use(async config => {
    const accessToken = getToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const deviceId = await getOrCreateDeviceId();
    config.headers['x-device-id'] = deviceId;

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
    async error => {
      const status = error?.response?.status as number | undefined;
      const originalConfig = error?.config as RetryableRequestConfig | undefined;

      if (
        status === 401 &&
        originalConfig &&
        !originalConfig._retry &&
        !String(originalConfig.url || '').includes('/auth/refresh')
      ) {
        originalConfig._retry = true;

        try {
          const nextAccessToken = await refreshAccessToken();
          originalConfig.headers = originalConfig.headers || {};
          originalConfig.headers.Authorization = `Bearer ${nextAccessToken}`;
          return client.request(originalConfig);
        } catch {
          await clearAuthState();
        }
      } else if (status === 401) {
        await clearAuthState();
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
