import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserInfo } from '../store/authStore';
import { setUnreadMessageCount, saveLocalMessages, getLocalMessages, saveLocalConversations } from '../store/messageStore';
import { MessageItem } from '../api/message';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Global singleton socket — prevents duplicate connections across components
let globalSocket: Socket | null = null;
let isConnecting = false;

const msgCallbacks = new Set<(msg: MessageItem) => void>();
const notifCallbacks = new Set<() => void>();

function getSocketInstance(userId: string): Socket | null {
  if (globalSocket?.connected) {
    return globalSocket;
  }
  if (isConnecting) {
    return null;
  }

  isConnecting = true;
  const socket = io(`${BASE_URL}/chat`, {
    query: { userId },
  });

  socket.on('connect', () => {
    console.log('✅ socket connected, userId:', userId);
    isConnecting = false;
  });

  socket.on('connect_error', (err) => {
    console.log('❌ socket connect error:', err.message);
    isConnecting = false;
  });

  socket.on('newMessage', async (msg: MessageItem) => {
    console.log('📨 socket newMessage:', msg.conversationId, msg.content);
    const local = await getLocalMessages(Number(msg.conversationId));
    const updated = [...local, msg];
    await saveLocalMessages(Number(msg.conversationId), updated);
    setUnreadMessageCount((getUnreadMessageCount() || 0) + 1);
    msgCallbacks.forEach((cb) => cb(msg));
  });

  socket.on('conversationsUpdated', async (conversations: any[]) => {
    await saveLocalConversations(conversations);
  });

  socket.on('notificationsUpdated', () => {
    console.log('🔔 socket notificationsUpdated');
    notifCallbacks.forEach((cb) => cb());
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ socket disconnected:', reason);
    globalSocket = null;
    isConnecting = false;
  });

  globalSocket = socket;
  return socket;
}

export function useSocket(
  onNewMessage?: (msg: MessageItem) => void,
  onNotificationsUpdated?: () => void,
) {
  useEffect(() => {
    if (onNewMessage) {
      msgCallbacks.add(onNewMessage);
      return () => { msgCallbacks.delete(onNewMessage); };
    }
  }, [onNewMessage]);

  useEffect(() => {
    if (onNotificationsUpdated) {
      notifCallbacks.add(onNotificationsUpdated);
      return () => { notifCallbacks.delete(onNotificationsUpdated); };
    }
  }, [onNotificationsUpdated]);

  const connect = useCallback(() => {
    const user = getUserInfo();
    if (!user?.id) return;
    getSocketInstance(String(user.id));
  }, []);

  const disconnect = useCallback(() => {
    if (msgCallbacks.size === 0 && notifCallbacks.size === 0) {
      globalSocket?.disconnect();
      globalSocket = null;
    }
  }, []);

  const sendMessage = useCallback((payload: {
    receiverId: number;
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string;
  }) => {
    const user = getUserInfo();
    if (!user?.id || !globalSocket) return;
    globalSocket.emit('sendMessage', {
      senderId: user.id,
      ...payload,
    });
  }, []);

  return { connect, disconnect, sendMessage, socket: globalSocket };
}

function getUnreadMessageCount(): number {
  try {
    const { getUnreadMessageCount: fn } = require('../store/messageStore');
    return fn();
  } catch {
    return 0;
  }
}
