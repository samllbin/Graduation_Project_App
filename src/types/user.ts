export type UserProfile = {
  id: number;
  userName: string;
  email: string;
  avatar: string;
  signature: string;
  ctime: string;
};

export type UpdateProfileReq = {
  avatar?: string;
  signature?: string;
};

export type ChangePasswordReq = {
  currentPassword: string;
  newPassword: string;
};
