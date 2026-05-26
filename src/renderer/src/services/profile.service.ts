import { api } from './api';

/**
 * Represents a lightweight game object in the user's profile.
 */
export interface ProfileGame {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Represents a gaming platform in the user's profile.
 */
export interface ProfilePlatform {
  id: number;
  name: string;
}

/**
 * Represents the complete user profile data transfer object.
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string | null;
  biography?: string | null;
  interestedGames: ProfileGame[];
  platforms: ProfilePlatform[];
}

/**
 * Data structure required to perform a secure password update.
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordCodeVerifiedResponse {
  verificationToken: string;
  message: string;
}

/**
 * Service responsible for managing HTTP requests related to the user profile and account security.
 */
export const ProfileService = {
  /**
   * Fetches the detailed profile information of the currently authenticated user.
   * @returns A promise that resolves to the user's profile data.
   */
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('profile/me');
    return response.data;
  },

  /**
   * Updates the profile information (username, bio, games, platforms) of the currently authenticated user.
   * @param profileData The updated profile object.
   */
  updateMyProfile: async (profileData: UserProfile): Promise<void> => {
    await api.put('/profile/me', profileData);
  },

  /**
   * Sends a request to update the user's account password.
   * @param data Object containing the current and new passwords.
   */
  changePassword: async (data: PasswordChangeData): Promise<void> => {
    await api.put('/profile/change-password', data);
  },

  requestPasswordChangeCode: async (): Promise<void> => {
    await api.post('/profile/me/password/change/request-code');
  },

  verifyPasswordChangeCode: async (code: string): Promise<PasswordCodeVerifiedResponse> => {
    const response = await api.post<PasswordCodeVerifiedResponse>('/profile/me/password/change/verify-code', { code });
    return response.data;
  },

  confirmPasswordChange: async (data: { verificationToken: string; newPassword: string }): Promise<void> => {
    await api.post('/profile/me/password/change/confirm', data);
  },

  /**
   * Uploads a new profile picture to AWS S3 and updates the authenticated user record.
   * @param file The validated image file object (PNG, JPEG, JPG).
   * @returns A promise resolving to the secure public URL string returned by the server.
   */
  updateAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.put<{ avatarUrl: string }>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.avatarUrl;
  }
};
