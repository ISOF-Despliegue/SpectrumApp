import { api } from './api';
import type { GameReviewDetail } from '../types/reviews.types';

export interface Game {
  id: number | string;
  title: string;
  imageUrl: string;
  released: string;
  spectrumRating: number;
  developer?: string;
  description?: string;
  releaseDate?: string | null;
  coverImageUrl?: string | null;
  internalRating?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getGames = async (search?: string, page: number = 1, sort: string = 'none'): Promise<PagedResponse<Game>> => {
  try {

    const sortMapping: Record<string, string> = {
      'name_asc': 'name',
      'name_desc': '-name',
      'date_new': '-released',
      'date_old': 'released',
      'rating_desc': '-rating',
      'none': ''
    };

    const response = await api.get<any>('/Games/search', {
      params: {
        Search: search,
        Page: page,
        PageSize: 42,
        Ordering: sortMapping[sort] || ''
      }
    });

    const data = response.data;

    return {
      items: (data.items || data.Items || []).map((game: any) => ({
        id: game.rawgId ?? game.RawgId ?? game.id,
        title: game.title,
        imageUrl: game.coverImageUrl || game.CoverImageUrl || " ",
        released: game.releaseDate || "",
        spectrumRating: game.internalRating || 0
      })),
      totalCount: data.totalCount ?? data.TotalCount ?? 0,
      page: data.page ?? data.Page ?? 1,
      pageSize: data.pageSize ?? data.PageSize ?? 42,
      totalPages: data.totalPages ?? data.TotalPages ?? 1
    };
  } catch (error) {
    throw error;
  }
};

export const getGameReviewDetail = async (gameId: number | string): Promise<GameReviewDetail> => {
  const response = await api.get<GameReviewDetail>(`/Games/${gameId}/reviews-detail`);
  const data = response.data;

  return {
    ...data,
    game: {
      ...data.game,
      id: (data.game as any).rawgId ?? (data.game as any).RawgId ?? data.game.id,
      title: data.game.title,
      imageUrl:
        data.game.imageUrl ||
        data.game.coverImageUrl ||
        (data.game as any).CoverImageUrl ||
        '',
      released:
        data.game.released ||
        data.game.releaseDate ||
        (data.game as any).ReleaseDate ||
        '',
      spectrumRating: data.game.spectrumRating ?? data.game.internalRating ?? 0
    }
  };
};
