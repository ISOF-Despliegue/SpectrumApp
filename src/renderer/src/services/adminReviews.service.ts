import { api } from './api';
import { PagedResult } from '../types/admin.types';
import { Review } from '../types/reviews.types';

export const AdminReviewsService = {
  search: async (params: {
    gameId?: number;
    gameQuery?: string;
    search?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<Review>> => {
    const response = await api.get<PagedResult<Review>>('/admin/reviews', { params });
    return response.data;
  },

  delete: async (reviewId: string): Promise<void> => {
    await api.delete(`/admin/reviews/${reviewId}`);
  }
};
