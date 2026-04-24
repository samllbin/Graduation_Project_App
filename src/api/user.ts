import { ApiResponse, ChangePasswordReq, UpdateProfileReq, UserProfile } from '../types';
import { http } from './http';

const asApiResponse = <T>(promise: Promise<any>) => promise as Promise<ApiResponse<T>>;

export const getUserProfileApi = (userName: string) =>
  asApiResponse<UserProfile>(http.get(`/user/${userName}`));

export const updateProfileApi = (params: UpdateProfileReq) =>
  asApiResponse<UserProfile>(http.patch('/user/profile', params));

export const uploadImageApi = (formData: FormData) =>
  asApiResponse<{
    fileName: string;
    filePath: string;
    originalName: string;
    url: string;
  }>(
    http.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );

export const changePasswordApi = (params: ChangePasswordReq) =>
  asApiResponse<null>(http.patch('/user/password', params));
