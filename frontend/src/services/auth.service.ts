import { apiClient } from './api-client';
import { User, AuthResponse, ApiResponse } from '../types/user.types';

export const authService = {
  async register(name: string, phone: string, password?: string): Promise<User & { token: string }> {
    const response = await apiClient.post<ApiResponse<User & { token: string }>>('/auth/register', { name, phone, password: password || 'defaultpass123' });
    return response.data.data;
  },

  async login(credentials: { identifier?: string; email?: string; phone?: string; password?: string } | string, passwordParam?: string): Promise<{ user: User; accessToken: string; token: string }> {
    const payload = typeof credentials === 'string' 
      ? { identifier: credentials, password: passwordParam }
      : credentials;
    const response = await apiClient.post<ApiResponse<{ user: User; accessToken: string; token: string }>>('/auth/login', payload);
    return response.data.data;
  },

  async updateProfile(userId: string, name: string, phone: string): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', { userId, name, phone });
    return response.data.data;
  }
};
