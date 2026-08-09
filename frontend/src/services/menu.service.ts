import { apiClient } from './api-client';
import { ApiResponse, Category, MenuItem } from '../types/menu.types';

export const menuService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  async getMenuItems(params?: { categoryId?: number; search?: string }): Promise<MenuItem[]> {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu-items', { params });
    return response.data.data;
  },

  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data.data;
  }
};
