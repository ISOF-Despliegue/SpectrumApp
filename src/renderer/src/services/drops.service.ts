import { api } from './api';
import {
  ClaimDropResult,
  DropActionResult,
  DropEvent,
  DropEventPage,
  DropEventPayload
} from '../types/drops.types';

export const DropsService = {
  listPublic: async (scope: string, page = 1, pageSize = 10): Promise<DropEventPage> => {
    const response = await api.get<DropEventPage>('/drops/events', {
      params: { scope, page, pageSize }
    });
    return response.data;
  },

  getPublic: async (eventId: string): Promise<DropEvent> => {
    const response = await api.get<DropEvent>(`/drops/event/${eventId}`);
    return response.data;
  },

  join: async (eventId: string): Promise<DropActionResult> => {
    const response = await api.post<DropActionResult>(`/drops/event/${eventId}/join`);
    return response.data;
  },

  claim: async (eventId: string, challengeCode: string): Promise<ClaimDropResult> => {
    const response = await api.post<ClaimDropResult>(`/drops/claim/${eventId}`, { challengeCode });
    return response.data;
  },

  listAdmin: async (scope = 'ALL', page = 1, pageSize = 10): Promise<DropEventPage> => {
    const response = await api.get<DropEventPage>('/admin/drops', {
      params: { scope, page, pageSize }
    });
    return response.data;
  },

  create: async (payload: DropEventPayload): Promise<DropActionResult> => {
    const response = await api.post<DropActionResult>('/admin/drops', payload);
    return response.data;
  },

  update: async (eventId: string, payload: DropEventPayload): Promise<DropActionResult> => {
    const response = await api.put<DropActionResult>(`/admin/drops/${eventId}`, payload);
    return response.data;
  },

  publish: async (eventId: string): Promise<DropActionResult> => {
    const response = await api.post<DropActionResult>(`/admin/drops/${eventId}/publish`);
    return response.data;
  },

  finish: async (eventId: string): Promise<DropActionResult> => {
    const response = await api.post<DropActionResult>(`/admin/drops/${eventId}/finish`);
    return response.data;
  },

  sendReward: async (eventId: string, rewardCode: string): Promise<DropActionResult> => {
    const response = await api.post<DropActionResult>(`/admin/drops/${eventId}/reward`, { rewardCode });
    return response.data;
  }
};
