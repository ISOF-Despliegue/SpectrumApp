import { api } from './api';

/// <summary>
/// Represents a lightweight game object in the user's profile.
/// </summary>
export interface ProfileGame {
  id: string;
  name: string;
}

/// <summary>
/// Represents a gaming platform in the user's profile.
/// </summary>
export interface ProfilePlatform {
  id: number;
  name: string;
}

/// <summary>
/// Represents the complete user profile data transfer object.
/// </summary>
export interface UserProfile {
  username: string;
  email: string;
  profilePicture?: string | null;
  biography?: string | null;
  interestedGames: ProfileGame[];
  platforms: ProfilePlatform[];
}

/// <summary>
/// Data structure required to perform a secure password update.
/// </summary>
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

/// <summary>
/// Service responsible for managing HTTP requests related to the user profile and account security.
/// </summary>
export const ProfileService = {
  /**
   * Fetches the detailed profile information of the currently authenticated user.
   * @returns A promise that resolves to the user's profile data.
   */
  getMe: async (): Promise<UserProfile> => {
    // Se mantiene la ruta sin /v1/ según los logs de error previos
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
    /// <summary>
    /// This endpoint handles the sensitive logic of password hashing and verification.
    /// It is kept separate from general profile updates for security compliance.
    /// </summary>
    await api.put('/profile/change-password', data);
  }
};
