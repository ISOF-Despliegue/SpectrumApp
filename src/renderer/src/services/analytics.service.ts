import { api } from './api';
import { GlobalMetrics, WeeklyClipsPage, WeeklyTrends } from '../types/analytics.types';

export const AnalyticsService = {
  getGlobalMetrics: async (period: string, anchorDate?: string): Promise<GlobalMetrics> => {
    const response = await api.get<GlobalMetrics>('/admin/metrics/global', {
      params: { period, anchorDate }
    });
    return response.data;
  },

  getWeeklyTrends: async (): Promise<WeeklyTrends> => {
    const response = await api.get<WeeklyTrends>('/trends/weekly');
    return response.data;
  },

  getWeeklyClips: async (page = 1, pageSize = 10): Promise<WeeklyClipsPage> => {
    const response = await api.get<WeeklyClipsPage>('/clips/weekly', {
      params: { page, pageSize }
    });
    return response.data;
  }
};
