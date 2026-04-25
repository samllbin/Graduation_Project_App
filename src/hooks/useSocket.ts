import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserInfo } from '../store/authStore';
import { setUnreadMessageCount, saveLocalMessages, getLocalMessages, saveLocalConversations } from '../store/messageStore';
import { MessageItem } from '../api/message';

const BASE_URL = 'http://10.0.2.2:3000';

export function useSocket(
  onNewMessage?: (msg: MessageItem) => void,
  onNotificationsUpdated?: () => void,
) {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const user = getUserInfo();
    if (!user?.id) return;

    if (socketRef.current?.connected) return;

    console.log('🔌 useSocket creating connection to', `${BASE_URL}/chat`, 'userId:', user.id);
    const socket = io(`${BASE_URL}/chat`, {
      query: { userId: user.id },
    });

    socket.on('connect', () => {
      console.log('✅ socket connected, userId:', user.id);
    });

    socket.on('connect_error', (err) => {
      console.log('❌ socket connect error:', err.message);
    });

    socket.on('newMessage', async (msg: MessageItem) => {
      console.log('📨 socket newMessage:', msg.conversationId, msg.content);
      const local = await getLocalMessages(Number(msg.conversationId));
      const updated = [...local, msg];
      await saveLocalMessages(Number(msg.conversationId), updated);
      setUnreadMessageCount((getUnreadMessageCount() || 0) + 1);
      onNewMessage?.(msg);
    });

    socket.on('conversationsUpdated', async (conversations: any[]) => {
      await saveLocalConversations(conversations);
    });

    socket.on('notificationsUpdated', () => {
      console.log('🔔 socket notificationsUpdated');
      onNotificationsUpdated?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ socket disconnected:', reason);
    });

    socketRef.current = socket;
  }, [onNewMessage, onNotificationsUpdated]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const sendMessage = useCallback((payload: {
    receiverId: number;
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string;
  }) => {
    const user = getUserInfo();
    if (!user?.id || !socketRef.current) return;
    socketRef.current.emit('sendMessage', {
      senderId: user.id,
      ...payload,
    });
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, sendMessage, socket: socketRef.current };
}

function getUnreadMessageCount(): number {
  try {
    const { getUnreadMessageCount: fn } = require('../store/messageStore');
    return fn();
  } catch {
    return 0;
  }
}
