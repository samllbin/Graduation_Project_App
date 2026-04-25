import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '../api/notification';

const NOTIFICATIONS_KEY = 'notifications';

let unreadNotificationCount = 0;

export const getUnreadNotificationCount = () => unreadNotificationCount;

export const setUnreadNotificationCount = (count: number) => {
  unreadNotificationCount = count;
};

export const getLocalNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalNotifications = async (notifications: NotificationItem[]) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {}
};

export const clearNotificationStore = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    unreadNotificationCount = 0;
  } catch {}
};
