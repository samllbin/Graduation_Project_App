import DeviceInfo from 'react-native-device-info';
import { trackPvApi, trackUvApi } from '../api/analytics';
import { getOrCreateDeviceId } from '../store/authSession';
import { getUserInfo } from '../store/authStore';

let deviceIdCache: string | null = null;

async function getDeviceId(): Promise<string> {
  if (!deviceIdCache) {
    deviceIdCache = await getOrCreateDeviceId();
  }
  return deviceIdCache;
}

export async function initAnalytics() {
  try {
    const deviceId = await getDeviceId();
    const appVersion = await DeviceInfo.getVersion();
    const userId = getUserInfo()?.id;

    await trackUvApi({ deviceId, appVersion, userId });
  } catch {
    // 静默失败
  }
}

export async function trackPageView(path: string) {
  try {
    const deviceId = await getDeviceId();
    const userId = getUserInfo()?.id;

    await trackPvApi({ path, deviceId, userId });
  } catch {
    // 静默失败
  }
}
