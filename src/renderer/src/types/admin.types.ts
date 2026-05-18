export interface UserModerationDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuspended: boolean;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
