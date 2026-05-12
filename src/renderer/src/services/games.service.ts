import { api } from './api';

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  released: string;
  spectrumRating: number;
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
        id: game.rawgId || game.id,
        title: game.title || game.name,
        imageUrl: game.background_image || game.coverImageUrl || game.backgroundImage || null,
        released: game.releaseDate || "",
        spectrumRating: game.internalRating || game.spectrumRating || 0
      })),
      totalCount: data.totalCount ?? data.TotalCount ?? 0,
      page: data.page ?? data.Page ?? 1,
      pageSize: data.pageSize ?? data.PageSize ?? 42,
      totalPages: data.totalPages ?? data.TotalPages ?? 1
    };
  } catch (error) {
    console.error("Error obtaining games:", error);
    throw error;
  }
};
