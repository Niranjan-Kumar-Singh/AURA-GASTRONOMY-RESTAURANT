import { apiClient } from './api-client';
import { ChatbotResponse } from '../types/chatbot.types';

export const chatbotService = {
  async ask(message: string, tableId?: string): Promise<ChatbotResponse> {
    const response = await apiClient.post<{ data: ChatbotResponse }>('/chatbot', { message, tableId });
    return response.data.data;
  },
};
