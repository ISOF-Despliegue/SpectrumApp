import { api } from './api';
import { AuthResponse } from './auth.service';

export interface CreateAdminPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  rfc: string;
}

export const AdminAdminsService = {
  create: async (payload: CreateAdminPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/admin/admins', {
      ...payload,
      adminSecretKey: 'admin-authenticated-flow'
    });
    return response.data;
  }
};
