import { apiClient } from './api-client';
import { ApiResponse } from '../types/user.types';
import { TableResponse, TableStatus } from '../types/order.types';

export const tableService = {
  async getAllTables(): Promise<TableResponse[]> {
    const response = await apiClient.get<ApiResponse<TableResponse[]>>('/tables');
    return response.data.data;
  },

  async updateTableStatus(tableId: number | string, status: TableStatus | string, guestCount?: number): Promise<TableResponse> {
    const response = await apiClient.put<ApiResponse<TableResponse>>(`/tables/${tableId}/status`, { status, guestCount });
    return response.data.data;
  },

  async validateQr(tableNumber: string, token: string, userId?: string) {
    const response = await apiClient.post('/tables/validate', { tableNumber, token, userId });
    return response.data.data;
  },

  async devSeedAndValidate(tableNumber: string, userId?: string) {
    const response = await apiClient.post('/tables/dev-seed', { tableNumber, userId });
    return response.data.data;
  },

  async getSession(sessionId: string) {
    const response = await apiClient.get(`/tables/session/${sessionId}`);
    return response.data.data;
  },

  async checkoutSession(tableNumber: string) {
    const response = await apiClient.post('/tables/checkout', { tableNumber, tableId: tableNumber });
    return response.data;
  },

  async callWaiter(tableId: string, reason: string) {
    const response = await apiClient.post('/tables/call-waiter', { tableId, reason });
    return response.data.data;
  },

  async getWaiterCalls() {
    const response = await apiClient.get('/tables/waiter-calls');
    return response.data.data;
  },

  async resolveWaiterCall(alertId: number) {
    const response = await apiClient.put(`/tables/waiter-calls/${alertId}/resolve`);
    return response.data.data;
  },
};
