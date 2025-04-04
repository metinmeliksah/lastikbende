import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Yaygın lastik markalarının model adlarının önbelleği
// Bu sayede basit düzeltmeler için API çağrısı yapmaya gerek kalmaz
const markaModelCache: Record<string, string[]> = {
  'Michelin': ['Pilot Sport 4', 'Pilot Sport 4S', 'Pilot Sport 5', 'Primacy 4', 'Primacy 4+', 'CrossClimate 2', 'CrossClimate+', 'Alpin 6', 'X-Ice Snow'],
  'Continental': ['PremiumContact 6', 'PremiumContact 7', 'EcoContact 6', 'SportContact 7', 'WinterContact TS 860', 'WinterContact TS 870'],
  'Bridgestone': ['Turanza T005', 'Potenza Sport', 'Potenza S007', 'Blizzak LM005', 'Weather Control A005 EVO'],
  'Goodyear': ['Eagle F1 Asymmetric 5', 'Eagle F1 Asymmetric 6', 'EfficientGrip Performance 2', 'UltraGrip Performance+', 'Vector 4Seasons Gen-3'],
  'Pirelli': ['P Zero', 'P Zero PZ4', 'Cinturato P7', 'Cinturato All Season Plus', 'Scorpion Verde', 'Winter Sottozero 3'],
  'Hankook': ['Ventus S1 Evo3', 'Ventus Prime4', 'Kinergy 4S2', 'Winter i*cept RS2', 'Winter i*cept Evo3'],
  'Lassa': ['Driveways', 'Driveways Sport', 'Competus H/P', 'Snoways 4', 'Impetus Revo 2+'],
};

export async function POST(request: Request) {
  try {
    const { field, value, context } = await request.json();

    if (!field || !value) {
      return NextResponse.json(
        { success: false, error: 'Alan ve değer bilgisi gereklidir' },
        { status: 400 }
      );
    }

    // Basit düzeltmeleri API çağrısı yapmadan gerçekleştir
    if (field === 'model' && context.marka && context.marka in markaModelCache) {
      const modelList = markaModelCache[context.marka];
      
      // Benzerlik kontrolü
      const closest = findClosestMatch(value, modelList);
      if (closest && closest !== value && similarity(closest, value) > 0.6) {
        return NextResponse.json({
          success: true,
          message: `Corrected value: "${closest}"`
        });
      }
    }

    const systemMessage = `You are a tire validation expert. Validate the user's tire information and provide correction suggestions if needed.`;

    let userMessage = '';
    switch (field) {
      case 'marka':
        userMessage = `Tire Brand: ${value}\nTire Type: ${context.lastikTipi || 'Not specified'}\nPlease validate this brand and suggest corrections if needed.`;
        break;
      case 'model':
        userMessage = `Tire Model: ${value}\nTire Brand: ${context.marka || 'Not specified'}\nTire Type: ${context.lastikTipi || 'Not specified'}\nPlease validate this model and suggest corrections if needed.`;
        break;
      case 'uretimYili':
        userMessage = `Production Year: ${value}\nPlease validate this year and suggest corrections if needed.`;
        break;
      case 'ebat':
        userMessage = `Tire Size: ${value}\nPlease validate this size and suggest corrections if needed.`;
        break;
      default:
        userMessage = `Field: ${field}\nValue: ${value}\nPlease validate this value and suggest corrections if needed.`;
    }

    // Yanıt hızını artırmak için daha küçük bir model ve daha az token kullan
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Daha hızlı yanıt için gpt-3.5-turbo kullanalım
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3, // Daha kesin sonuçlar için daha düşük sıcaklık
        max_tokens: 100 // Daha az token
      });

      const response = completion.choices[0].message.content;
      const correctedValue = response?.match(/Corrected value: "([^"]+)"/)?.[1];

      if (correctedValue && correctedValue !== value) {
        return NextResponse.json({
          success: true,
          message: `Corrected value: "${correctedValue}"`
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Validation successful'
      });
    } catch (openaiError: any) {
      console.error('OpenAI API hatası:', openaiError);
      
      // OpenAI API hatalarını özel olarak işle
      if (openaiError.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Çok fazla istek gönderildi, lütfen kısa bir süre sonra tekrar deneyin.' },
          { status: 429 }
        );
      } else if (openaiError.status === 401 || openaiError.status === 403) {
        return NextResponse.json(
          { success: false, error: 'API yetkilendirme hatası.' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'OpenAI API ile iletişim kurulurken bir hata oluştu.' },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Validasyon hatası:', error);
    
    // Hatanın tipine göre detaylı bilgi dön
    let errorMessage = 'Doğrulama işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.';
    let statusCode = 500;
    
    if (error.name === 'SyntaxError') {
      errorMessage = 'İstek formatı geçersiz.';
      statusCode = 400;
    } else if (error.name === 'TypeError') {
      errorMessage = 'Veri formatı işlenirken bir hata oluştu.';
      statusCode = 400;
    } else if (error.message?.includes('network')) {
      errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// İki string arasındaki benzerliği hesaplar (0-1 arası değer döndürür)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1.toLowerCase() : s2.toLowerCase();
  const shorter = s1.length > s2.length ? s2.toLowerCase() : s1.toLowerCase();
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  // Levensthein mesafesi hesaplama yerine basit bir eşleşme kontrolü yapalım
  if (longer.includes(shorter)) {
    return 0.8;
  }
  
  // Basit benzerlik hesabı: Kaç harf eşleşiyor
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }
  
  return matches / longer.length;
}

// Verilen değere en yakın eşleşmeyi bulur
function findClosestMatch(value: string, options: string[]): string | null {
  let bestMatch = null;
  let bestSimilarity = 0;
  
  const lowerValue = value.toLowerCase();
  
  for (const option of options) {
    const lowerOption = option.toLowerCase();
    
    // Tam eşleşme varsa hemen döndür
    if (lowerOption === lowerValue) {
      return option;
    }
    
    // Kısmi eşleşme kontrolü
    if (lowerOption.includes(lowerValue) || lowerValue.includes(lowerOption)) {
      const sim = similarity(lowerValue, lowerOption);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestMatch = option;
      }
    }
  }
  
  return bestMatch;
} 
