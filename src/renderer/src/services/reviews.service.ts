import { api } from './api';

export interface Review {
  id: string;
  reviewId?: string;
  gameId: number | string;
  userId?: string;
  username?: string;
  title: string;
  content: string;
  rating: number;
  likesCount?: number;
  dislikesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  gameId: number | string;
  title: string;
  content: string;
  rating: number;
}

export interface UpdateReviewRequest {
  title: string;
  content: string;
  rating: number;
}

export interface CastReviewVoteRequest {
  isPositive: boolean;
}

export const ReviewService = {
  getById: async (reviewId: string): Promise<Review> => {
    const response = await api.get<Review>(`/Reviews/${reviewId}`);
    return response.data;
  },

  getByGame: async (gameId: number | string): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/Reviews/game/${gameId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/Reviews/me');
    return response.data;
  },

  create: async (payload: CreateReviewRequest): Promise<Review> => {
    const response = await api.post<Review>('/Reviews', payload);
    return response.data;
  },

  update: async (
    reviewId: string,
    payload: UpdateReviewRequest
  ): Promise<void> => {
    await api.put(`/Reviews/${reviewId}`, payload);
  },

  delete: async (reviewId: string): Promise<void> => {
    await api.delete(`/Reviews/${reviewId}`);
  },

  vote: async (
    reviewId: string,
    payload: CastReviewVoteRequest
  ): Promise<void> => {
    await api.post(`/Reviews/${reviewId}/vote`, payload);
  }
};
