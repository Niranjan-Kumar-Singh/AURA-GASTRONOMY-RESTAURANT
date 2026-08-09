import { apiClient } from './api-client';
import { ApiResponse } from '../types/user.types';

export interface DashboardAnalytics {
  totalRevenueToday: number;
  totalOrdersToday: number;
  activeTablesCount: number;
  vacantTablesCount: number;
  pendingKitchenTicketsCount: number;
}

export interface AdminMetrics {
  users: number;
  staff: number;
  dishes: number;
  ongoingOrders: number;
  completedOrders: number;
  revenue: number;
  profit: number;
}

export const adminService = {
  async getAnalyticsSummary(): Promise<DashboardAnalytics> {
    const response = await apiClient.get<ApiResponse<DashboardAnalytics>>('/admin/analytics');
    return response.data.data;
  },

  async getMetrics(): Promise<AdminMetrics> {
    const response = await apiClient.get('/admin/metrics');
    return response.data.data;
  }
};
