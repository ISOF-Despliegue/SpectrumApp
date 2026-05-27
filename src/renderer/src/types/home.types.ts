import type { DropEvent } from './drops.types';

export interface HomeGame {
  gameId: number;
  title: string;
  coverImageUrl: string;
  releaseDate?: string | null;
}

export interface HomeReview {
  reviewId: string;
  userId: string;
  username: string;
  gameId: number;
  gameTitle: string;
  gameCoverUrl: string;
  title: string;
  content: string;
  rating: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface HomeDashboard {
  bannerTitle: string;
  bannerSubtitle: string;
  recentGames: HomeGame[];
  popularReviewsToday: HomeReview[];
  weeklyDrops: DropEvent[];
}

export interface GlobalSearchItem {
  type: 'game' | 'user';
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
}

export interface GlobalSearchResult {
  games: GlobalSearchItem[];
  users: GlobalSearchItem[];
}
