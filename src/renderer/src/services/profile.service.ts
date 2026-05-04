import { api } from './api';

export interface UserProfile {
  username: string;
  email: string;
  profilePicture: string | null;
}

export const ProfileService = {
  /**
   * Fetches the current user's profile data from the API.
   */
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/profile/me');
    return response.data;
  }
};
