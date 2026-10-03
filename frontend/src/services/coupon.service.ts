import { apiClient } from './api-client';
import { Coupon } from '../types/menu.types';

export const couponService = {
  async validateCoupon(code: string, subtotal?: number): Promise<Coupon> {
    const url = subtotal !== undefined
      ? `/coupons/validate/${encodeURIComponent(code)}?subtotal=${subtotal}`
      : `/coupons/validate/${encodeURIComponent(code)}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  async getAllCoupons(): Promise<Coupon[]> {
    const response = await apiClient.get(`/coupons`);
    return response.data.data;
  },

  async createCoupon(payload: Partial<Coupon>): Promise<Coupon> {
    const response = await apiClient.post('/coupons', payload);
    return response.data.data;
  },

  async updateCoupon(id: string, payload: Partial<Coupon>): Promise<Coupon> {
    const response = await apiClient.put(`/coupons/${id}`, payload);
    return response.data.data;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/coupons/${id}`);
    return response.data.success;
  }
};
