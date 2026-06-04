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
  commentsCount: number;
  sourceType: 'REVIEW' | 'GAME_CLIP';
  userVote?: 'like' | 'dislike' | null;
  isOwnContent: boolean;
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

export interface NamedMetric {
  id: string;
  label: string;
  count: number;
  score: number;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  profileImageUrl?: string | null;
  iconUrl?: string | null;
  gameId?: number | string | null;
  userId?: string | null;
  username?: string | null;
}

export interface TrendsDashboard {
  weekStart: string;
  weekEnd: string;
  monthStart: string;
  monthEnd: string;
  weeklyInteractions: NamedMetric[];
  weeklyDiscussions: WeeklyReview[];
  worstOfWeek: NamedMetric[];
  bestOfWeek: NamedMetric[];
  consoleOfMonth: NamedMetric[];
  topReviewersOfMonth: NamedMetric[];
  genresOfMonth: NamedMetric[];
}

export interface CryptDashboard {
  monthStart: string;
  monthEnd: string;
  worstGames: NamedMetric[];
  gamesWithoutReviews: NamedMetric[];
}

export type WeeklyClipsPage = PagedResult<WeeklyReview>;
