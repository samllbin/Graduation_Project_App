import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { trackJsErrorApi } from '../api/analytics';
import { getUserInfo } from '../store/authStore';

const ERROR_TRACKER_KEY = '@error_tracker:last_reported';
const DEDUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getErrorHash(message: string, stack?: string): string {
  const raw = (message.slice(0, 50) + (stack?.slice(0, 100) || '')).replace(/\s/g, '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(hash);
}

async function shouldReport(hash: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ERROR_TRACKER_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    const last = map[hash] || 0;
    const now = Date.now();
    if (now - last < DEDUP_INTERVAL_MS) {
      return false;
    }
    map[hash] = now;
    // 清理过期记录
    Object.keys(map).forEach((k) => {
      if (now - map[k] > DEDUP_INTERVAL_MS) delete map[k];
    });
    await AsyncStorage.setItem(ERROR_TRACKER_KEY, JSON.stringify(map));
    return true;
  } catch {
    return true;
  }
}

async function buildDeviceInfo(): Promise<string> {
  try {
    const [brand, model, systemVersion] = await Promise.all([
      DeviceInfo.getBrand(),
      DeviceInfo.getModel(),
      DeviceInfo.getSystemVersion(),
    ]);
    return `${brand} ${model} Android ${systemVersion}`;
  } catch {
    return '';
  }
}

async function reportError(error: Error | string, isFatal?: boolean) {
  const message = typeof error === 'string' ? error : error.message || 'Unknown error';
  const stack = typeof error === 'string' ? undefined : error.stack;
  const hash = getErrorHash(message, stack);

  const canReport = await shouldReport(hash);
  if (!canReport) return;

  try {
    const [deviceInfo, appVersion] = await Promise.all([
      buildDeviceInfo(),
      DeviceInfo.getVersion(),
    ]);
    const userId = getUserInfo()?.id;

    await trackJsErrorApi({
      message: isFatal ? `[FATAL] ${message}` : message,
      stack: stack || '',
      deviceInfo,
      appVersion,
      userId,
    });
  } catch {
    // 静默失败，避免循环上报
  }
}

export function initErrorTracker() {
  // 捕获同步 JS 错误
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    reportError(error, isFatal).catch(() => {});
    originalHandler(error, isFatal);
  });

  // 捕获未处理的 Promise rejection
  const originalRejection = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: { reason: any }) => {
    const reason = event?.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason));
    reportError(error, false).catch(() => {});
    if (typeof originalRejection === 'function') {
      originalRejection(event);
    }
  };
}
