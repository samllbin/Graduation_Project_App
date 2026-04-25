import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageItem, ConversationItem } from '../api/message';

const CONVERSATIONS_KEY = 'conversations';
const MESSAGES_PREFIX = 'messages:';

let unreadMessageCount = 0;

export const getUnreadMessageCount = () => unreadMessageCount;

export const setUnreadMessageCount = (count: number) => {
  unreadMessageCount = count;
};

export const getLocalConversations = async (): Promise<ConversationItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalConversations = async (conversations: ConversationItem[]) => {
  try {
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {}
};

export const getLocalMessages = async (conversationId: number): Promise<MessageItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${MESSAGES_PREFIX}${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalMessages = async (conversationId: number, messages: MessageItem[]) => {
  try {
    await AsyncStorage.setItem(`${MESSAGES_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch {}
};

export const clearMessageStore = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const messageKeys = keys.filter(k => k.startsWith(MESSAGES_PREFIX) || k === CONVERSATIONS_KEY);
    await AsyncStorage.multiRemove(messageKeys);
    unreadMessageCount = 0;
  } catch {}
};
