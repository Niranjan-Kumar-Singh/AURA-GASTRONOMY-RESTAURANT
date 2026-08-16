export interface ChatbotOption {
  label: string;
  query: string;
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  quickOptions?: ChatbotOption[];
  isTyping?: boolean;
}

export interface ChatbotResponse {
  reply: string;
  quickOptions?: ChatbotOption[];
}
