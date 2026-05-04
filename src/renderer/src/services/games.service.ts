import { api } from './api';

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  released: string;
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
      'none': ''
    };

    const response = await api.get<PagedResponse<any>>('/Games/search', {
      params: {
        Search: search,
        Page: page,
        PageSize: 42,
        Ordering: sortMapping[sort] || ''
      }
    });

    const data = response.data;
    return {
      ...data,
      items: data.items.map((game: any) => ({
        id: game.id,
        title: game.name,
        imageUrl: game.backgroundImage || game.background_image || null,
        released: game.released || ""
      }))
    };
  } catch (error) {
    console.error("Error obtaining games:", error);
    throw error;
  }
};
