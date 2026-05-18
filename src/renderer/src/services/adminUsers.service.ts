import { api } from './api';
import { PagedResult, UserModerationDto } from '../types/admin.types';

export const getModeratedUsers = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string
): Promise<PagedResult<UserModerationDto>> => {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (searchTerm) params.append('searchTerm', searchTerm);

  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleUserSuspension = async (id: string, suspend: boolean): Promise<void> => {
  const action = suspend ? 'suspend' : 'reactivate';
  await api.patch(`/admin/users/${id}/${action}`);
};
