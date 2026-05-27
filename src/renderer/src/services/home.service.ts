import { api } from './api';
import type { GlobalSearchResult, HomeDashboard } from '../types/home.types';

export const HomeService = {
  getDashboard: async (): Promise<HomeDashboard> => {
    const response = await api.get<HomeDashboard>('/home/dashboard');
    return response.data;
  },

  searchGlobal: async (query: string): Promise<GlobalSearchResult> => {
    const response = await api.get<GlobalSearchResult>('/search/global', {
      params: { q: query }
    });
    return response.data;
  }
};
