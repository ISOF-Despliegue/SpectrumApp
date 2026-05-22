import type { Game } from '../services/games.service';

export interface ReviewComment {
  id: string;
  userId: string;
  reviewId: string;
  content: string;
  publishedAt: string;
  username: string;
  userProfilePicture: string;
  isOwnComment: boolean;
  canDelete: boolean;
}

export interface Review {
  id: string;
  gameId: number;
  userId: string;
  username: string;
  userProfileImageUrl: string;
  profilePicture?: string;
  gameTitle: string;
  gameCoverUrl: string;
  title: string;
  content: string;
  rating: number;
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  updatedAt?: string | null;
  isOwnReview: boolean;
  canDelete: boolean;
}

export interface GameReviewDetail {
  game: Game;
  reviews: Review[];
  averageRating: number | null;
  reviewsCount: number;
}

export interface ReviewFormValues {
  title: string;
  content: string;
  rating: number;
  file?: File | null;
}

export interface CreateReviewRequest {
  gameId: number;
  title: string;
  content: string;
  rating: number;
  imageUrl?: string;
  mediaType?: string;
}

export interface UpdateReviewRequest {
  title: string;
  content: string;
  rating: number;
  imageUrl?: string;
  mediaType?: string;
}

export interface UploadedReviewAttachment {
  url: string;
  mediaType: string;
}
