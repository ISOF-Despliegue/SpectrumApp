import { api } from './api';
import type {
  CreateReviewRequest,
  Review,
  ReviewComment,
  UploadedReviewAttachment,
  UpdateReviewRequest
} from '../types/reviews.types';

export interface CastReviewVoteRequest {
  isPositive: boolean;
}

export interface VoteResult {
  success: boolean;
  updatedLikes: number;
  updatedDislikes: number;
}

const sendFormData = <T>(url: string, formData: FormData): Promise<T> => {
  return api
    .post<T>(url, formData, {
      transformRequest: (data, headers) => {
        delete headers['Content-Type'];
        return data;
      }
    })
    .then((response) => response.data);
};

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

  update: async (reviewId: string, payload: UpdateReviewRequest): Promise<void> => {
    await api.put(`/Reviews/${reviewId}`, payload);
  },

  delete: async (reviewId: string): Promise<void> => {
    await api.delete(`/Reviews/${reviewId}`);
  },

  vote: async (reviewId: string, payload: CastReviewVoteRequest): Promise<VoteResult> => {
    const response = await api.post<VoteResult>(`/Reviews/${reviewId}/vote`, payload);
    return response.data;
  },

  getComments: async (reviewId: string, page = 1): Promise<ReviewComment[]> => {
    const response = await api.get<ReviewComment[]>(`/Reviews/${reviewId}/comments`, {
      params: { page }
    });
    return response.data;
  },

  createComment: async (reviewId: string, content: string): Promise<ReviewComment> => {
    const response = await api.post<ReviewComment>(`/Reviews/${reviewId}/comments`, { content });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/Reviews/comments/${commentId}`);
  },

  uploadAttachment: async (file: File): Promise<UploadedReviewAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    return sendFormData<UploadedReviewAttachment>('/Media/reviews/attachment', formData);
  }
};
