import { api } from './api'

export interface Review {
  id: string
  reviewId?: string
  gameId: number | string
  userId?: string
  username?: string
  userProfileImageUrl?: string | null
  profilePicture?: string | null
  title: string
  content: string
  rating: number
  score?: number
  imageUrl?: string | null
  gameCoverUrl?: string | null
  likesCount?: number
  dislikesCount?: number
  likedByUser?: boolean
  dislikedByUser?: boolean
  isOwnReview?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateReviewRequest {
  gameId: number | string
  title: string
  content: string
  rating: number
}

export interface UpdateReviewRequest {
  title: string
  content: string
  rating: number
}

export interface CastReviewVoteRequest {
  isPositive: boolean
}

export interface VoteResult {
  success: boolean
  updatedLikes: number
  updatedDislikes: number
}

export interface CreateReviewCommentRequest {
  content: string
}

export interface ReviewCommentResponse {
  id: string
  reviewId: string
  userId?: string
  username?: string
  content: string
  createdAt?: string
}

export const ReviewService = {
  getById: async (reviewId: string): Promise<Review> => {
    const response = await api.get<Review>(`/Reviews/${reviewId}`)
    return response.data
  },

  getByGame: async (gameId: number | string): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/Reviews/game/${gameId}`)
    return response.data
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/Reviews/me')
    return response.data
  },

  create: async (payload: CreateReviewRequest): Promise<Review> => {
    const response = await api.post<Review>('/Reviews', payload)
    return response.data
  },

  update: async (reviewId: string, payload: UpdateReviewRequest): Promise<Review | undefined> => {
    const response = await api.put<Review>(`/Reviews/${reviewId}`, payload)
    return response.data
  },

  delete: async (reviewId: string): Promise<void> => {
    await api.delete(`/Reviews/${reviewId}`)
  },

  vote: async (reviewId: string, payload: CastReviewVoteRequest): Promise<VoteResult> => {
    const response = await api.post<VoteResult>(`/Reviews/${reviewId}/vote`, payload)
    return response.data
  },

  getComments: async (reviewId: string): Promise<ReviewCommentResponse[]> => {
    const response = await api.get<ReviewCommentResponse[]>(`/Reviews/${reviewId}/comments`)
    return response.data
  },

  createComment: async (
    reviewId: string,
    payload: CreateReviewCommentRequest
  ): Promise<ReviewCommentResponse> => {
    const response = await api.post<ReviewCommentResponse>(`/Reviews/${reviewId}/comments`, payload)
    return response.data
  }
}
