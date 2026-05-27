import { PagedResult } from './admin.types';

export interface MetricPoint {
  date: string;
  label: string;
  count: number;
}

export interface TopGameMetric {
  gameId: number;
  gameTitle: string;
  coverImageUrl: string;
  count: number;
}

export interface GlobalMetrics {
  windowStart: string;
  windowEnd: string;
  newUsers: MetricPoint[];
  newReviews: MetricPoint[];
  mostSearchedGames: TopGameMetric[];
}

export interface WeeklyReview {
  reviewId: string;
  userId: string;
  username: string;
  gameId: number;
  gameTitle: string;
  gameCoverUrl: string;
  title: string;
  content: string;
  attachmentUrl: string;
  attachmentType: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
}

export interface WeeklyTrendGame {
  rank: number;
  gameId: number;
  gameTitle: string;
  coverImageUrl: string;
  reviewsCount: number;
  reviews: WeeklyReview[];
}

export interface WeeklyTrends {
  weekStart: string;
  weekEnd: string;
  games: WeeklyTrendGame[];
}

export type WeeklyClipsPage = PagedResult<WeeklyReview>;
