import { apiClient } from './api-client';
import { CartItem } from '../types/menu.types';

export interface OrderPayload {
  tableId: string;
  customerPhone?: string;
  customerName?: string;
  items: {
    menuItemId: number;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon?: string;
  sessionId?: string;
}

export const orderService = {
  async placeOrder(payload: OrderPayload) {
    const response = await apiClient.post('/orders', payload);
    return response.data.data;
  },

  async getOrder(orderId: string) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data;
  },

  async getOrdersByPhone(phone: string) {
    const response = await apiClient.get(`/orders/phone/${phone}`);
    return response.data.data;
  },

  async getOrdersByTable(tableId: string) {
    const response = await apiClient.get(`/orders/table/${tableId}`);
    return response.data.data;
  },

  async getActiveOrders() {
    const response = await apiClient.get('/orders/active/all');
    return response.data.data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  async settleTableBill(tableId: string | number, paymentMethod: string = 'UPI_QR') {
    const response = await apiClient.post('/orders/pay-table', { tableId: String(tableId), paymentMethod });
    return response.data;
  }
};
