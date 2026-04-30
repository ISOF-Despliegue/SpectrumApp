// src/renderer/src/services/games.service.ts
import { api } from './api';

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  releaseDate?: string;
}

export const getGames = async (search?: string): Promise<Game[]> => {
  try {
    const response = await api.get<any[]>('/Games/search', {
      params: {
        Search: search,
        PageSize: 40
      }
    });

    console.log("Primer juego:", response.data[0]);

    return response.data.map((game: any) => ({
      id: game.id,
      title: game.name,
      imageUrl: game.background_image ?? null,
      description: game.description,
      releaseDate: game.released
    }));
  } catch (error) {
    console.error("Error al obtener los juegos:", error);
    throw error;
  }
};
