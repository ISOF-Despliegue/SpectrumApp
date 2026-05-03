import { api } from './api';

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getGames = async (search?: string, page: number = 1): Promise<PagedResponse<Game>> => {
  try {
    const response = await api.get<PagedResponse<any>>('/Games/search', {
      params: {
        Search: search,
        Page: page,
        PageSize: 40
      }
    });

    const data = response.data;
    return {
      ...data,
      items: data.items.map((game: any) => ({
        id: game.id,
        title: game.name,
        imageUrl: game.backgroundImage || game.background_image || null
      }))
    };
  } catch (error) {
    console.error("Error al obtener los juegos:", error);
    throw error;
  }
};
