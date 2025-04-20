import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz istek formatı. "messages" dizisi gereklidir.' },
        { status: 400 }
      );
    }

    console.log('Received chat messages:', messages);

    // OpenAI API isteği
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    // API yanıtını işleme
    const responseContent = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: responseContent,
    });
  } catch (error: any) {
    console.error('Chat API Hatası:', error);
    
    // Hata mesajını döndür
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sohbet isteği işlenirken bir hata oluştu.', 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 