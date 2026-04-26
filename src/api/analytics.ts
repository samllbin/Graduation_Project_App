import { http } from './http';

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<{ code: number; message: string; data: T }>;

export const trackPvApi = (data: { path: string; deviceId: string; userId?: number }) =>
  asApiResponse<null>(http.post('/analytics/track/pv', data));

export const trackUvApi = (data: { deviceId: string; appVersion: string; userId?: number }) =>
  asApiResponse<null>(http.post('/analytics/track/uv', data));

export const trackJsErrorApi = (data: {
  message: string;
  stack?: string;
  deviceInfo?: string;
  appVersion?: string;
  userId?: number;
}) => asApiResponse<null>(http.post('/analytics/track/js-error', data));
