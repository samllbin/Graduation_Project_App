export type PostImage = {
  imageUrl: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

export type PostAuthor = {
  userName: string;
  avatar: string;
};

export type PostItem = {
  id: number;
  userId: number;
  title: string | null;
  contentText: string;
  coverImageUrl: string | null;
  imageCount: number;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  liked?: boolean;
  author?: PostAuthor;
  images: PostImage[];
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedPostList = {
  list: PostItem[];
  pagination: Pagination;
};
