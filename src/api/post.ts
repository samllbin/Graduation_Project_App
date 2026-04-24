import { ApiResponse, PaginatedPostList } from '../types';
import { http } from './http';

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<ApiResponse<T>>;

export const getPostListApi = (sortBy?: string, page = 1, pageSize = 10) =>
  asApiResponse<PaginatedPostList>(http.get('/post/list', { params: { sortBy, page, pageSize } }));

export const getLikedPostsApi = (page = 1, pageSize = 10) =>
  asApiResponse<PaginatedPostList>(http.get('/post/liked', { params: { page, pageSize } }));

export const likePostApi = (postId: number) =>
  asApiResponse<{ id: number; liked: boolean; likeCount: number }>(
    http.post('/post/like', { id: postId }),
  );

export const unlikePostApi = (postId: number) =>
  asApiResponse<{ id: number; liked: boolean; likeCount: number }>(
    http.post('/post/unlike', { id: postId }),
  );
