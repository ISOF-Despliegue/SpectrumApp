import { api } from './api';
import {
  CryptDashboard,
  GlobalMetrics,
  TrendsDashboard,
  WeeklyClipsPage,
  WeeklyReview,
  WeeklyTrends
} from '../types/analytics.types';

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

  getTrendsDashboard: async (): Promise<TrendsDashboard> => {
    const response = await api.get<TrendsDashboard>('/trends/dashboard');
    return response.data;
  },

  getCryptDashboard: async (): Promise<CryptDashboard> => {
    const response = await api.get<CryptDashboard>('/crypt/dashboard');
    return response.data;
  },

  getWeeklyClips: async (page = 1, pageSize = 10): Promise<WeeklyClipsPage> => {
    const response = await api.get<WeeklyClipsPage>('/clips/weekly', {
      params: { page, pageSize }
    });
    return response.data;
  },

  getMonthlyTopClips: async (): Promise<WeeklyReview[]> => {
    const response = await api.get<WeeklyReview[]>('/clips/weekly/monthly-top');
    return response.data;
  }
};
