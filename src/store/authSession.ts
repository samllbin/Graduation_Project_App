import DeviceInfo from 'react-native-device-info';
import * as Keychain from 'react-native-keychain';

const AUTH_SERVICE = 'awesomeproject.auth.session';
const AUTH_USERNAME = 'session';

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  userInfo?: {
    id: number;
    userName: string;
    avatar: string;
    signature: string;
  };
};

const parseSession = (raw: string): AuthSession | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string' &&
      typeof parsed.deviceId === 'string'
    ) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        deviceId: parsed.deviceId,
        userInfo: parsed.userInfo || undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
};

const readSession = async (): Promise<AuthSession | null> => {
  const credentials = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
  if (!credentials) {
    return null;
  }

  return parseSession(credentials.password);
};

const writeSession = async (session: AuthSession): Promise<void> => {
  await Keychain.setGenericPassword(AUTH_USERNAME, JSON.stringify(session), {
    service: AUTH_SERVICE,
  });
};

export const getOrCreateDeviceId = async (): Promise<string> => {
  const session = await readSession();
  if (session?.deviceId) {
    return session.deviceId;
  }

  const deviceId = await DeviceInfo.getUniqueId();
  const nextSession: AuthSession = {
    accessToken: session?.accessToken || '',
    refreshToken: session?.refreshToken || '',
    deviceId,
  };
  await writeSession(nextSession);
  return deviceId;
};

export const getSessionTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> => {
  const session = await readSession();
  if (!session) {
    return null;
  }

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
};

export const saveSession = async (params: {
  accessToken: string;
  refreshToken: string;
  userInfo?: AuthSession['userInfo'] | null;
}): Promise<void> => {
  const session = await readSession();
  const deviceId = session?.deviceId || (await DeviceInfo.getUniqueId());

  await writeSession({
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
    deviceId,
    userInfo: params.userInfo || undefined,
  });
};

export const updateAccessToken = async (accessToken: string): Promise<void> => {
  const session = await readSession();
  if (!session) {
    const deviceId = await DeviceInfo.getUniqueId();
    await writeSession({
      accessToken,
      refreshToken: '',
      deviceId,
    });
    return;
  }

  await writeSession({
    ...session,
    accessToken,
  });
};

export const getStoredRefreshToken = async (): Promise<string> => {
  const session = await readSession();
  return session?.refreshToken || '';
};

export const getStoredUserInfo = async (): Promise<AuthSession['userInfo'] | null> => {
  const session = await readSession();
  return session?.userInfo || null;
};

export const updateStoredUserInfo = async (userInfo: AuthSession['userInfo']): Promise<void> => {
  const session = await readSession();
  if (!session) {
    return;
  }
  await writeSession({ ...session, userInfo });
};

export const clearSession = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
};
