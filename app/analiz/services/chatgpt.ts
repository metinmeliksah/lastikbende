import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  correctedValue?: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 150
    });

    const response = completion.choices[0].message.content;
    const correctedValue = response?.match(/Corrected value: "([^"]+)"/)?.[1];

    if (correctedValue) {
      return {
        success: true,
        message: `Corrected value: "${correctedValue}"`,
        correctedValue
      };
    }

    return {
      success: true,
      message: response || 'Chat completed successfully'
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      message: 'An error occurred during chat'
    };
  }
} 
