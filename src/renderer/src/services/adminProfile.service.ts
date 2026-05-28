import { api } from './api';

export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  rfc: string;
  profilePicture?: string | null;
  role: string;
}

export type UpdateAdminProfilePayload = Pick<
  AdminProfile,
  'username' | 'firstName' | 'lastName' | 'phoneNumber' | 'address' | 'profilePicture'
>;

export const AdminProfileService = {
  getMe: async (): Promise<AdminProfile> => {
    const response = await api.get<AdminProfile>('/admin/profile');
    return response.data;
  },

  updateMe: async (payload: UpdateAdminProfilePayload): Promise<AdminProfile> => {
    const response = await api.put<AdminProfile>('/admin/profile', payload);
    return response.data;
  }
};
