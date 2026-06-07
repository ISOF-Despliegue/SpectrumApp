import { api } from './api';
import { PagedResult, UserModerationDto, AdminUserDetailDto } from '../types/admin.types';

export const getModeratedUsers = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
  status?: string
): Promise<PagedResult<UserModerationDto>> => {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (searchTerm) params.append('search', searchTerm);
  if (status) params.append('status', status);

  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleUserSuspension = async (id: string, suspend: boolean): Promise<void> => {
  const action = suspend ? 'suspend' : 'reactivate';
  await api.patch(`/admin/users/${id}/${action}`);
};

export const toggleUserBan = async (id: string, ban: boolean, reason?: string): Promise<void> => {
  const action = ban ? 'ban' : 'unban';
  await api.patch(`/admin/users/${id}/${action}`, reason ? { reason } : {});
};

export const reactivateUser = async (id: string): Promise<void> => {
  await api.patch(`/admin/users/${id}/reactivate`);
};

export const getUserDetail = async (id: string): Promise<AdminUserDetailDto> => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};
