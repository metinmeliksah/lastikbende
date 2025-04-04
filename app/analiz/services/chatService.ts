import { API_CONFIG } from '../config/api';

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  correctedValue?: string;
}

export const sendChatMessage = async (
  messages: ChatMessage[]
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      message: 'An error occurred during chat'
    };
  }
}; 