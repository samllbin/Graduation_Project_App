import { http } from './http';

export type MessageItem = {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  type: 'text' | 'image';
  content: string;
  imageUrl: string | null;
  isRead: number;
  createdAt: string;
};

export type ConversationItem = {
  id: number;
  userAId: number;
  userBId: number;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  unreadCountA: number;
  unreadCountB: number;
  createdAt: string;
  otherUserName?: string;
  otherUserAvatar?: string | null;
};

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<{ code: number; message: string; data: T }>;

export const getConversationApi = (otherUserId: number) =>
  asApiResponse<ConversationItem>(http.get('/message/conversation', { params: { otherUserId } }));

export const getConversationsApi = () =>
  asApiResponse<ConversationItem[]>(http.get('/message/conversations'));

export const getMessagesApi = (conversationId: number, page = 1) =>
  asApiResponse<{ list: MessageItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>(
    http.get('/message/list', { params: { conversationId, page } }),
  );

export const sendMessageApi = (params: {
  receiverId: number;
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}) => asApiResponse<MessageItem>(http.post('/message/send', params));

export const readMessagesApi = (conversationId: number) =>
  asApiResponse<null>(http.post('/message/read', { conversationId }));

export const getUnreadCountApi = () =>
  asApiResponse<number>(http.get('/message/unread-count'));
