import { http } from './http';

export type NotificationItem = {
  id: number;
  userId: number;
  type: 'like' | 'comment';
  postId: number;
  postTitle: string | null;
  postCoverUrl: string | null;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  count: number;
  isRead: number;
  createdAt: string;
};

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<{ code: number; message: string; data: T }>;

export const getNotificationsApi = (page = 1) =>
  asApiResponse<{ list: NotificationItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>(
    http.get('/notification/list', { params: { page } }),
  );

export const readNotificationsApi = (ids?: number[]) =>
  asApiResponse<null>(http.post('/notification/read', { ids }));

export const getUnreadNotificationCountApi = () =>
  asApiResponse<{ count: number }>(http.get('/notification/unread-count'));
