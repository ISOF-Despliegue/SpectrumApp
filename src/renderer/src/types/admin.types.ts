export interface UserModerationDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuspended: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminUserDetailDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuspended: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  createdAt: string;
  avatarUrl?: string | null;
  totalReviews: number;
  totalClips: number;
}
