export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
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
    const response = await fetch('/analiz/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat service error:', error);
    return {
      success: false,
      message: 'Sohbet sırasında bir hata oluştu. Lütfen tekrar deneyiniz.'
    };
  }
}; 