import { ApiResponse, PaginatedPostList, PostItem } from '../types';
import { http } from './http';

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<ApiResponse<T>>;

export const getPostListApi = (sortBy?: string, page = 1, pageSize = 10) =>
  asApiResponse<PaginatedPostList>(http.get('/post/list', { params: { sortBy, page, pageSize } }));

export const getLikedPostsApi = (page = 1, pageSize = 10) =>
  asApiResponse<PaginatedPostList>(http.get('/post/liked', { params: { page, pageSize } }));

export const getPostDetailApi = (id: number) =>
  asApiResponse<PostItem>(http.get('/post/detail', { params: { id } }));

export const likePostApi = (postId: number) =>
  asApiResponse<{ id: number; liked: boolean; likeCount: number }>(
    http.post('/post/like', { id: postId }),
  );

export const unlikePostApi = (postId: number) =>
  asApiResponse<{ id: number; liked: boolean; likeCount: number }>(
    http.post('/post/unlike', { id: postId }),
  );

export const deletePostApi = (postId: number) =>
  asApiResponse<{ id: number }>(http.post('/post/delete', { id: postId }));

export const createPostApi = (body: {
  title?: string;
  contentText?: string;
  images?: Array<{ imageUrl: string; sortOrder: number; width?: number; height?: number }>;
}) => asApiResponse<PostItem>(http.post('/post/create', body));

export type CommentItem = {
  id: number;
  postId: number;
  userId: number;
  contentText: string;
  level: number;
  parentId: number | null;
  rootId: number | null;
  replyToUserId: number | null;
  replyCount: number;
  createdAt: string;
  author: { userName: string; avatar: string } | null;
  replyToUser: { userName: string } | null;
  replies: CommentItem[];
};

export type PaginatedCommentList = {
  list: CommentItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const getCommentListApi = (postId: number, page = 1, pageSize = 10) =>
  asApiResponse<PaginatedCommentList>(
    http.get('/post/comment/list', { params: { postId, page, pageSize } }),
  );

export const createCommentApi = (body: {
  postId: number;
  contentText?: string;
  parentId?: number;
  replyToUserId?: number;
}) => asApiResponse<CommentItem>(http.post('/post/comment/create', body));

export const deleteCommentApi = (id: number) =>
  asApiResponse<{ id: number }>(http.post('/post/comment/delete', { id }));

export const uploadImageApi = (file: { uri: string; name: string; type: string }) => {
  const formData = new FormData();
  formData.append('file', file as any);
  return asApiResponse<{ url: string; filePath: string }>(
    http.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
};
