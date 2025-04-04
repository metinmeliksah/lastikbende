import { NextRequest, NextResponse } from 'next/server';
import { analyzeTireImage } from '../../services/azure-vision';
import OpenAI from 'openai';
import { cacheAdapter } from '../../lib/cacheAdapter';

// OpenAI API istemcisini oluştur
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Türkçe hata mesajları
const errorMessages = {
  missingImage: 'Resim verisi eksik',
  tireNotDetected: 'Lastik tespit edilemedi',
  analysisError: 'Analiz sırasında bir hata oluştu'
};

// Tip tanımlamaları
interface Problem {
  type: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  location?: string; // location özelliği opsiyonel olarak eklendi
  description: string;
  suggestedAction: string;
  urgency: 'immediate' | 'soon' | 'monitor' | 'optional';
  estimatedCost: 'high' | 'medium' | 'low';
  safetyImpact: 'critical' | 'significant' | 'moderate' | 'minor';
  maintenanceType: 'replacement' | 'repair' | 'adjustment' | 'monitoring';
}

interface MaintenanceNeeds {
  immediate: string[];
  soon: string[];
  future: string[];
}

interface TireAnalysisResult {
  yasPuani: number;
  kullanimPuani: number;
  mevsimselPuan: number;
  markaPuani: number;
  gorselDurum: number;
  sorunlar: Problem[];
  oneriler: string[];
  ozet: string;
  detayliAnaliz?: string;
  safetyScore: number;
  maintenanceNeeds: MaintenanceNeeds;
  estimatedLifespan: {
    months: number;
    confidence: number;
  };
}

// ChatGPT'den kişiselleştirilmiş analiz sonuçları almak için fonksiyon
async function getPersonalizedAnalysisFromGPT(formData: any, azureResults: any, tireAge: number): Promise<any> {
  try {
    // İngilizce istek oluştur - backend tarafında İngilizce
    const tireInfo = {
      type: formData.lastikTipi === 'yaz' ? 'Summer' : 
            formData.lastikTipi === 'kis' ? 'Winter' : 
            formData.lastikTipi === 'dortMevsim' ? 'All Season' : 'Unknown',
      brand: formData.marka || 'Unknown',
      model: formData.model || 'Unknown',
      size: formData.ebat || 'Unknown',
      productionYear: formData.uretimYili || 'Unknown',
      mileage: formData.kilometre || 'Unknown',
      tireAge: tireAge
    };

    // Azure Vision analiz sonuçlarını ekle
    const visionTags = azureResults?.tags?.map((tag: any) => tag.name).join(', ') || '';
    const visionDescription = azureResults?.description || '';

    // Gerçekçi yaş hesaplaması 
    const currentYear = new Date().getFullYear();
    const productionYear = parseInt(formData.uretimYili) || currentYear;
    const actualTireAge = Math.max(0, currentYear - productionYear);
    
    // Gelecek tarihli üretim yılı kontrolü
    const isFutureProductionYear = productionYear > currentYear;
    
    // Mevsimsellik kontrolü
    const currentMonth = new Date().getMonth() + 1; // 1-12 arası
    const isWinterSeason = currentMonth >= 11 || currentMonth <= 3; // Kasım-Mart arası kış
    
    // Türkçe lastik tipini belirle - daha kolay anlaşılabilir sonuçlar için
    const turkishTireType = formData.lastikTipi === 'yaz' ? 'Yaz Lastiği' : 
                          formData.lastikTipi === 'kis' ? 'Kış Lastiği' : 
                          formData.lastikTipi === 'dortMevsim' ? '4 Mevsim Lastiği' : 'Bilinmeyen';

    const prompt = `
      Sen uzman bir lastik analisti olarak görev yapıyorsun.
      Aşağıdaki detaylı bilgiler doğrultusunda bir lastik analizi yapman gerekiyor.

      LİSTIK BİLGİLERİ:
      - Tip: ${turkishTireType}
      - Marka: ${formData.marka || 'Belirtilmemiş'}
      - Model: ${formData.model || 'Belirtilmemiş'}
      - Ebat: ${formData.ebat || 'Belirtilmemiş'}
      - Üretim Yılı: ${formData.uretimYili || 'Belirtilmemiş'} (${isFutureProductionYear ? 'Gelecek tarihli üretim - henüz üretilmemiş veya yeni üretilmiş' : `Güncel yaş: ${actualTireAge} yıl`})
      - Kilometre: ${formData.kilometre || 'Belirtilmemiş'}
      - Mevcut Mevsim: ${isWinterSeason ? 'Kış' : 'Yaz/İlkbahar/Sonbahar'}

      GÖRSEL ANALİZ:
      - Tespit Edilen Etiketler: ${visionTags}
      - Görsel Açıklama: ${visionDescription}

      ANALİZ NOTLARI:
      ${isFutureProductionYear ? 
        '- Üretim yılı gelecek tarihli görünüyor, bu yüzden lastik henüz üretilmemiş veya çok yeni olabilir.' +
        '- Yaşa bağlı sorunlar (kuruma, çatlama vb.) raporlama, ancak dikkat edilmesi gereken noktaları belirt.' : 
        ''
      }
      ${actualTireAge < 1 ? 
        '- Bu lastik çok yeni (1 yaşından küçük).' +
        '- Genellikle yeni lastiklerde yaşa bağlı sorunlar görülmez, ancak üretim hataları, uygun olmayan montaj veya bakım önerileri gibi konulara odaklan.' : 
        ''
      }
      ${actualTireAge > 5 ? 
        '- Bu lastik 5 yıldan daha eski (yaş: ' + actualTireAge + ' yıl).' +
        '- Yaşlanmaya bağlı risk faktörlerini vurgula ve güvenlik önerilerinde detaylı ol.' : 
        ''
      }
      ${isWinterSeason && formData.lastikTipi === 'yaz' ? 
        '- Şu anda kış mevsimindeyiz, ancak araçta yaz lastiği kullanılıyor. Bu önemli bir güvenlik riski oluşturabilir.' : 
        ''
      }
      ${!isWinterSeason && formData.lastikTipi === 'kis' ? 
        '- Şu anda kış mevsiminde değiliz, ancak araçta kış lastiği kullanılıyor. Bu lastik aşınmasını hızlandırabilir.' : 
        ''
      }

      YANIT FORMATI:
      Sağlanan bilgilere dayanarak aşağıdaki JSON formatında kapsamlı bir analiz sunmalısın:

      {
        "summary": "Detaylı analiz özeti (minimum 5-6 cümle). Lastiğin genel durumu, önemli sorunlar ve risk seviyeleri hakkında kapsamlı bir açıklama.",
        
        "specialConsiderations": "Bu özel lastik modeli için geçerli olan beklenen aşınma desenleri, marka/model ile ilgili bilinen sorunlar gibi özel değerlendirmeler (minimum 3-4 cümle).",

        "recommendations": [
          "Detaylı kullanım önerileri ve bu lastik için en iyi uygulamalar (her öneri açık ve detaylı)"
        ],
        
        "additionalFindings": {
          "performanceRating": "Bu lastik türünün farklı koşullardaki performans değerlendirmesi (3-4 cümle)",
          "futureMaintenance": "Gelecekteki potansiyel bakım ihtiyaçları ve zamanlamaları",
          "valueAnalysis": "Fiyat/performans değerlendirmesi ve lastik kullanımının ekonomik analizi",
          "compatibilityNotes": "Araç tipleri ve sürüş stilleriyle uyumluluk analizi"
        },
        
        "safetyScore": Genel güvenlik puanı (0-100 arası),
        
        "estimatedLifespan": Tahmini kalan ömür (ay olarak),
        
        "maintenanceRecommendations": {
          "immediate": ["Acilen yapılması gereken bakım önerileri"],
          "soon": ["Yakın gelecekte yapılması gereken bakım önerileri"],
          "future": ["Uzun vadeli bakım önerileri"]
        }
      }

      DETAYLI TALİMATLAR:
      - Analiz kapsamlı, detaylı ve belirtilen lastik bilgilerine özel olmalıdır.
      - Mümkün olduğunca gerçekçi ve teknik bilgiler kullan.
      - Özet bölümünü en az 5-6 cümle uzunluğunda yap ve lastiğin durumunu, risk faktörlerini ve önemli noktaları kapsamlı bir şekilde açıkla.
      - Özel değerlendirmeler bölümünde en az 3-4 cümle kullanarak bu marka/model için önemli detayları anlat.
      - Lastik göreceli olarak yeni veya iyi durumda olsa bile, izlenmesi gereken en az 1-2 potansiyel küçük sorunu belirt.
      - Analizi yaparken sadece yaş ve teknik verilere değil, görsel analiz sonuçlarını da değerlendir.
      - Analiz çok uzman bir göz tarafından yapılmış gibi olmalı, teknik lastik terimleri kullanılmalı.
      - SADECE geçerli JSON döndür, kod blokları veya açıklamalar ekleme.
      - Yanıttaki tüm metinler Türkçe olmalıdır ve akıcı, anlaşılır olmalıdır.
    `;

    // OpenAI API'ye istek gönder
    console.log('Sending request to OpenAI API...');
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o', // Güvenilir ve hızlı yanıt için 3.5 modeli
      messages: [
        { 
          role: 'system', 
          content: 'Sen uzman bir lastik analistisin ve detaylı analizlerini JSON formatında sunarsın. Her zaman açıklama eklemeden sadece geçerli JSON döndür. Yanıtların her zaman Türkçe olmalı ve son derece profesyonel, teknik ve detaylı olmalıdır. Lastik uzmanı gibi düşün, konuş ve analiz et.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4, // Daha tutarlı ve aynı zamanda yaratıcı sonuçlar için
      response_format: { type: "json_object" }, // JSON yanıtı iste
      max_tokens: 1500, // Daha uzun ve detaylı yanıtlar için token limitini artır
    });

    // Yanıtı parse et
    const content = gptResponse.choices[0]?.message?.content || '{}';
    console.log('GPT Response received, parsing results...');
    
    // JSON'ı parse et ve hataları ele al
    try {
      const parsedResponse = JSON.parse(content);
      
      // Analiz detaylarını string olarak sakla - frontend tarafında kullanılmak üzere
      const detayliAnaliz = JSON.stringify({
        summary: parsedResponse.summary,
        specialConsiderations: parsedResponse.specialConsiderations,
        additionalFindings: parsedResponse.additionalFindings
      });
      
      // Önceki yapıyı bozmadan yeni alanları ekleyelim
      parsedResponse.detayliAnaliz = detayliAnaliz;
      
      return parsedResponse;
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      console.log('Raw GPT response:', content);
      return {}; // Boş nesne dön, hata durumunda
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {}; // Hata durumunda boş nesne dön
  }
}

// Sorunları tespit etmek için detaylı ChatGPT istemi
async function getDetailedProblemsFromGPT(formData: any, azureResults: any, tireAge: number): Promise<any> {
  try {
    // İngilizce istek oluştur - backend tarafında İngilizce
    const tireInfo = {
      type: formData.lastikTipi === 'yaz' ? 'Summer' : 
            formData.lastikTipi === 'kis' ? 'Winter' : 
            formData.lastikTipi === 'dortMevsim' ? 'All Season' : 'Unknown',
      brand: formData.marka || 'Unknown',
      model: formData.model || 'Unknown',
      size: formData.ebat || 'Unknown',
      productionYear: formData.uretimYili || 'Unknown',
      mileage: formData.kilometre || 'Unknown',
      tireAge: tireAge
    };

    // Azure Vision analiz sonuçlarını ekle
    const visionTags = azureResults?.tags?.map((tag: any) => tag.name).join(', ') || '';
    const visionDescription = azureResults?.description || '';
    
    // Gerçekçi yaş hesaplaması 
    const currentYear = new Date().getFullYear();
    const productionYear = parseInt(formData.uretimYili) || currentYear;
    const actualTireAge = Math.max(0, currentYear - productionYear);
    
    // Gelecek tarihli üretim yılı kontrolü
    const isFutureProductionYear = productionYear > currentYear;

    const prompt = `
      You are an expert tire analyst and your task is to identify potential issues with a tire based on the provided information.
      Focus ONLY on identifying potential problems with the tire, their severity, and recommendations.

      Tire Information:
      - Type: ${tireInfo.type}
      - Brand: ${tireInfo.brand}
      - Model: ${tireInfo.model}
      - Size: ${tireInfo.size}
      - Production Year: ${productionYear} (${isFutureProductionYear ? 'This is a future date - tire has not been manufactured yet' : `Current age: ${actualTireAge} years`})
      - Mileage: ${tireInfo.mileage}

      Vision Analysis:
      - Detected Tags: ${visionTags}
      - Description: ${visionDescription}

      CRITICAL ANALYSIS NOTES:
      ${isFutureProductionYear ? 
        '- The production year is in the future, so this tire is not yet manufactured or is newly manufactured.' +
        '- DO NOT report age-related issues like dry rot, cracking, or age-related hardening.' +
        '- Only report issues that can be visually identified in the image or very minor preventative concerns.' : 
        ''
      }
      ${actualTireAge < 1 ? 
        '- This tire is brand new (less than 1 year old).' +
        '- DO NOT report age-related issues like dry rot, cracking, or age-related hardening.' +
        '- Focus only on manufacturing defects, improper installation, or preventative maintenance concerns.' : 
        ''
      }

      IMPORTANT FORMATTING INSTRUCTION:
      - All descriptions must be SINGLE PARAGRAPH format with 1-2 sentences maximum
      - Keep all text fields concise and to the point
      - Avoid lengthy technical explanations
      - Focus on clearly stating the problem and its primary impact

      SPECIFIC FORMAT FOR DESCRIPTION FIELD:
      - Description field MUST BE only 1-2 sentences maximum
      - DO NOT include multiple paragraphs or bullet points
      - Description should directly explain the issue in a simple, clear way
      - Aim for a description that is easy to read at a glance

      Respond in Turkish language with a comprehensive list of potential issues in JSON format.

      For each issue, provide the following details in Turkish:
      
      {
        "sorunlar": [
          {
            "type": "Detailed issue type in Turkish (e.g., 'Yanak Hasarı', 'Diş Aşınması')",
            "severity": "high" | "medium" | "low",
            "description": "A single concise paragraph (1-2 sentences max) that briefly explains the issue and its impact on the tire.",
            "location": "Specific part of the tire where the issue is detected (e.g., 'Dış Yanak', 'Sırt Bölgesi', 'İç Omuz')",
            "problemOrigin": "Brief explanation of how this problem typically forms (1 sentence)",
            "visualSigns": "Brief description of visual indicators (1 sentence)",
            "suggestedAction": "Concise recommendation on how to address the issue (1-2 sentences max)",
            "urgency": "immediate" | "soon" | "monitor" | "optional",
            "estimatedCost": "high" | "medium" | "low",
            "safetyImpact": "critical" | "significant" | "moderate" | "minor",
            "maintenanceType": "replacement" | "repair" | "adjustment" | "monitoring",
            "confidence": A number between 0.5 and 0.98 representing confidence level
          }
        ]
      }

      IMPORTANT GUIDELINES:
      1. BE REALISTIC AND ACCURATE. Only report issues that are likely based on the tire's actual age and condition.
      2. For new tires or tires with future production dates, focus on proper inflation, storage, and preventative maintenance.
      3. Keep descriptions concise and to the point - avoid unnecessary technical jargon.
      4. Provide brief information about WHERE on the tire the problem is detected.
      5. Explain simply HOW such problems typically form.
      6. Describe the main VISUAL SIGNS of the problem in one sentence.
      7. Provide brief and actionable recommendations.
      8. Tailor issues based on the tire type (winter/summer/all-season).
      9. Only if the tire is older than 5 years, include age-related issues.
      10. Return valid JSON format only, with Turkish text.
      11. ALL descriptions must be single paragraphs, not multiple sentences or bullet points.
      12. DO NOT INVENT ISSUES THAT AREN'T REALISTIC for the tire's age and condition.
    `;

    // OpenAI API'ye istek gönder
    console.log('Sending detailed problems request to OpenAI API...');
    console.log(`Actual tire age: ${actualTireAge} years, Production Year: ${productionYear}`);
    
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Hız ve maliyet açısından 3.5 modeli kullan
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert tire analyst focusing only on detailed problem identification. Always return valid JSON with concise Turkish descriptions. Each description MUST BE a SINGLE PARAGRAPH with 1-2 sentences maximum, never longer. LIMIT ALL DESCRIPTIONS TO 150 CHARACTERS MAXIMUM. Keep all text fields extremely concise. Descriptions should be readable at a glance and never contain multiple paragraphs or bullet points. DO NOT exceed 150 characters in any description field.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    // Yanıtı parse et
    const content = gptResponse.choices[0]?.message?.content || '{"sorunlar":[]}';
    console.log('Detailed problems received from GPT');
    
    try {
      // Yanıtı doğrula ve temizle - yaş/yıl ile ilgili hatalı sorunları filtrele
      const parsedContent = JSON.parse(content);
      
      // Yeni/üretilmemiş lastikler için yaşa bağlı sorunları filtrele
      if (isFutureProductionYear || actualTireAge < 1) {
        if (parsedContent.sorunlar && Array.isArray(parsedContent.sorunlar)) {
          // Yaşla ilgili kelimeleri içeren sorunları filtrele
          const ageRelatedKeywords = ['kuru', 'çatlak', 'yaşlan', 'eskime', 'sertleş', 'yıpran', 'bayat', 'ömür'];
          
          parsedContent.sorunlar = parsedContent.sorunlar.filter((issue: { type: string; description: string; }) => {
            // Başlık ve açıklamada yaşla ilgili kelimeler var mı kontrol et
            const combinedText = `${issue.type} ${issue.description}`.toLowerCase();
            return !ageRelatedKeywords.some(keyword => combinedText.includes(keyword));
          });
          
          // Eğer tüm sorunlar filtrelendiyse, yeni lastik için uygun bir bakım önerisi ekle
          if (parsedContent.sorunlar.length === 0) {
            parsedContent.sorunlar.push({
              "type": "Alıştırma Dönemi",
              "severity": "low" as const,
              "description": "Yeni lastikler ilk 500 km'de alıştırma dönemine ihtiyaç duyar, bu süreçte yüzeydeki koruyucu maddeler aşınarak yol ile tam temas sağlanır.",
              "location": "Tüm lastik yüzeyi",
              "problemOrigin": "Üretim sırasında lastik yüzeyine uygulanan koruyucu maddeler ve kalıp izleri ilk kullanımda mevcuttur.",
              "visualSigns": "Lastik yüzeyinde hafif parlaklık ve sırt bölgesinde üretimden kaynaklanan izler görülebilir.",
              "suggestedAction": "İlk 500 km boyunca ani hızlanma ve sert frenlerden kaçınarak orta seviyede hızlarda sürüş yapın.",
              "urgency": "soon" as const,
              "estimatedCost": "low" as const,
              "safetyImpact": "moderate" as const,
              "maintenanceType": "monitoring" as const,
              "confidence": 0.95
            });
          }
        }
      }
      
      return parsedContent;
    } catch (error) {
      console.error('Error parsing GPT response for problems:', error);
      console.log('Raw GPT response:', content);
      return { sorunlar: [] };
    }
  } catch (error) {
    console.error('Error calling OpenAI API for detailed problems:', error);
    return { sorunlar: [] };
  }
}

// Marka puanını hesaplayan yeni fonksiyon
async function getBrandScoreFromGPT(brand: string, model: string, tireType: string): Promise<number> {
  try {
    console.log(`Getting brand score for ${brand} ${model} (${tireType})`);
    
    // Marka ve model bilgisini kontrol et
    if (!brand || brand.toLowerCase() === 'unknown' || brand.trim() === '') {
      console.log('No brand information provided, using default score');
      return 70; // Bilinmeyen marka için varsayılan puan
    }
    
    const prompt = `
      You are a tire expert. Based on your knowledge of tire brands, provide a quality score for this tire:
      
      Brand: ${brand}
      Model: ${model || 'Not specified'}
      Type: ${tireType === 'yaz' ? 'Summer' : tireType === 'kis' ? 'Winter' : 'All Season'}
      
      Please analyze the quality, reliability, and overall reputation of this tire brand and model.
      Return ONLY a single number between 50 and 98 representing the brand quality score.
      
      Higher tier brands (like Michelin, Continental, Pirelli, Bridgestone, Goodyear) should score 85-98.
      Mid-tier brands (like Hankook, Yokohama, Toyo, Falken, Kumho) should score 75-85.
      Budget/economy brands should score 65-75.
      Unknown or very low-end brands should score 50-65.
      
      For well-known models with specific advantages (like Michelin Pilot Sport, Continental ExtremeContact, etc.), 
      give bonus points within their tier range.
      
      Return only the numerical score without any other text.
    `;
    
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Güncel model versiyonu
      messages: [
        { 
          role: 'system', 
          content: 'You are a tire expert that provides accurate quality scores for tire brands. Return only a number between 50 and 98.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Daha tutarlı sonuçlar için düşük temperature
      max_tokens: 10,  // Sadece puanı dönmesi için küçük token limiti
      response_format: { type: "text" }, // Sadece metin olarak yanıt iste
    });
    
    const content = gptResponse.choices[0]?.message?.content?.trim() || '';
    const brandScore = parseInt(content);
    
    if (isNaN(brandScore) || brandScore < 50 || brandScore > 98) {
      console.log('Invalid brand score returned, using default:', content);
      return 80; // Geçersiz puan durumunda varsayılan değer
    }
    
    console.log(`Brand score for ${brand} ${model || ''}: ${brandScore}`);
    return brandScore;
  } catch (error) {
    console.error('Error getting brand score:', error);
    return 75; // Hata durumunda varsayılan puan
  }
}

// Kullanım puanını hesaplayan yeni fonksiyon
function calculateUsageScore(mileage: string, tireAge: number, visualConditionScore: number): number {
  try {
    console.log(`Calculating usage score for mileage: ${mileage}, age: ${tireAge}, visual condition: ${visualConditionScore}`);
    
    // Kilometre bilgisini temizle ve sayıya çevir
    const cleanedMileage = mileage ? mileage.replace(/[^\d]/g, '') : '';
    const parsedMileage = parseInt(cleanedMileage);
    
    // Varsayılan puan
    let score = 80;
    
    // Kilometre değeri olmadığında veya geçersiz olduğunda
    if (isNaN(parsedMileage)) {
      console.log('No valid mileage information, using formula based on age and visual condition');
      // Görsel durum ve yaş temelli bir hesaplama yap
      score = Math.max(30, 95 - (tireAge * 4));
      // Görsel durum puanını kısmen dikkate al
      const visualAdjustment = (visualConditionScore - 70) * 0.3;
      score += visualAdjustment;
      
      console.log(`Calculated usage score without mileage: ${score} (visual adjustment: ${visualAdjustment})`);
      return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    // Kilometre değeri varsa daha kesin bir hesaplama yap
    
    // Ortalama yıllık kilometre
    const yearlyMileage = tireAge > 0 ? parsedMileage / tireAge : parsedMileage;
    console.log(`Yearly mileage estimate: ${yearlyMileage}`);
    
    // Ortalama bir binek lastik için tavsiye edilen yıllık kilometre: ~15,000-20,000 km
    // Ortalama lastik ömrü: ~40,000-80,000 km (lastik tipine göre değişir)
    
    // Temel puan: 90 (ideal durum)
    score = 90;
    
    // Toplam kilometre bazlı düşüş
    if (parsedMileage > 10000) {
      // 10,000 km üzerinde her 10,000 km için -5 puan
      const mileageDeduction = Math.min(50, Math.floor((parsedMileage - 10000) / 10000) * 5);
      score -= mileageDeduction;
      console.log(`Mileage impact: -${mileageDeduction} points`);
    }
    
    // Yaş bazlı katsayı - belirli bir yaşın üzerinde ekstra aşınma etkisi
    if (tireAge > 4) {
      const ageFactor = Math.min(20, (tireAge - 4) * 4);
      score -= ageFactor;
      console.log(`Age factor impact: -${ageFactor} points`);
    }
    
    // Aşırı yıllık kullanım için ek düşüş
    if (yearlyMileage > 25000) {
      const heavyUsageDeduction = Math.min(15, Math.floor((yearlyMileage - 25000) / 5000) * 3);
      score -= heavyUsageDeduction;
      console.log(`Heavy yearly usage impact: -${heavyUsageDeduction} points`);
    }
    
    // Görsel durumu da hesaba kat - eğer görsel durum düşükse kullanım da etkilenir
    const visualConditionImpact = (visualConditionScore < 70) ? ((visualConditionScore - 70) * 0.25) : 0;
    score += visualConditionImpact;
    console.log(`Visual condition correlation impact: ${visualConditionImpact} points`);
    
    // Puanı sınırla
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    console.log(`Final usage score: ${finalScore}`);
    return finalScore;
  } catch (error) {
    console.error('Error calculating usage score:', error);
    return 80; // Hata durumunda varsayılan puan
  }
}

// Güvenlik puanını hesaplayan yeni fonksiyon
function calculateSafetyScore(
  yasPuani: number,
  kullanimPuani: number,
  mevsimselPuan: number,
  markaPuani: number,
  gorselDurum: number,
  tireAge: number
): number {
  try {
    console.log('Calculating integrated safety score from all factors');
    
    // Güvenlik puanı hesaplaması için ağırlık faktörleri
    // Not: Toplam ağırlık 100 olmalı
    const weights = {
      yasPuani: 25,        // Yaş en önemli güvenlik faktörlerinden biri
      gorselDurum: 30,     // Görsel durum en kritik faktör
      mevsimselPuan: 20,   // Mevsimsel uygunluk önemli güvenlik faktörü
      kullanimPuani: 15,   // Kullanım durumu
      markaPuani: 10       // Marka kalitesi
    };
    
    // Tüm puanları ve ağırlıklarını dikkate alarak hesaplama
    let safetyScore = 
      (yasPuani * weights.yasPuani / 100) +
      (gorselDurum * weights.gorselDurum / 100) +
      (mevsimselPuan * weights.mevsimselPuan / 100) +
      (kullanimPuani * weights.kullanimPuani / 100) +
      (markaPuani * weights.markaPuani / 100);
    
    // 10 yaşından büyük lastikler için ek güvenlik düşüşü
    if (tireAge > 10) {
      const agePenalty = Math.min(20, (tireAge - 10) * 2);
      safetyScore = Math.max(20, safetyScore - agePenalty);
      console.log(`Additional safety penalty for old tire (${tireAge} years): -${agePenalty}`);
    }
    
    // Çok düşük puan alan herhangi bir kategoride ek güvenlik düşüşü
    const criticalThreshold = 40;
    const criticalCategories = [];
    
    if (yasPuani < criticalThreshold) criticalCategories.push('yaş');
    if (gorselDurum < criticalThreshold) criticalCategories.push('görsel durum');
    if (mevsimselPuan < criticalThreshold) criticalCategories.push('mevsimsel uygunluk');
    
    if (criticalCategories.length > 0) {
      // Her kritik kategori için ekstra %5 düşüş
      const criticalPenalty = criticalCategories.length * 5;
      safetyScore = Math.max(15, safetyScore - criticalPenalty);
      console.log(`Critical category penalty (${criticalCategories.join(', ')}): -${criticalPenalty}`);
    }
    
    // Puanı sınırla ve yuvarla
    const finalScore = Math.max(0, Math.min(100, Math.round(safetyScore)));
    console.log(`Final integrated safety score: ${finalScore}`);
    
    return finalScore;
  } catch (error) {
    console.error('Error calculating safety score:', error);
    // Hata durumunda yaş bazlı basit hesaplama - 5 yaşından sonra her yıl için 6 puan düşüş
    return Math.max(30, Math.min(95, 95 - tireAge * 6));
  }
}

// Azure Vision API'den tespit edilen negatif faktörleri ayıklayan fonksiyon
function extractNegativeFactorsFromVision(visionData: any): Problem[] {
  try {
    if (!visionData || !visionData.tags) {
      console.warn('Vision data is missing or incomplete, cannot extract negative factors');
      return [];
    }
    
    const tags = visionData.tags || [];
    const detectedProblems: Problem[] = [];
    
    // Negatif faktör eşleştirme tanımı - her negatif etiket için sorun oluşturma
    const problemMappings = [
      // İngilizce etiketler için sorun tanımları
      { keyword: 'worn', type: 'aşınma', severity: 'medium' as const, description: 'Lastik yüzeyinde aşınma belirtileri tespit edildi, bu durum yol tutuşunu ve frenleme performansını olumsuz etkileyebilir.', suggestedAction: 'Diş derinliğini kontrol edin ve yasal sınırların altındaysa değişim planlayın.', urgency: 'soon' as const, estimatedCost: 'medium' as const, safetyImpact: 'significant' as const, maintenanceType: 'monitoring' as const },
      { keyword: 'damaged', type: 'hasar', severity: 'high' as const, description: 'Lastik üzerinde fiziksel hasar tespit edildi, bu durum ani basınç kaybı ve yol tutuş sorunlarına yol açabilir.', suggestedAction: 'Hasarın derinliği ve konumuna bağlı olarak uzman tarafından incelenmesi veya lastiğin değiştirilmesi gerekir.', urgency: 'immediate' as const, estimatedCost: 'medium' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
      { keyword: 'crack', type: 'çatlak', severity: 'high' as const, description: 'Lastik yüzeyinde çatlak tespit edildi, çatlaklar lastiğin yapısal bütünlüğünü tehlikeye atabilir.', suggestedAction: 'Çatlağın boyutu ve konumuna bağlı olarak değişim gerekebilir, acilen uzman kontrolü önerilir.', urgency: 'immediate' as const, estimatedCost: 'high' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
      { keyword: 'flat', type: 'basınç kaybı', severity: 'medium' as const, description: 'Lastik basıncı düşük görünüyor, düşük basınç yakıt tüketimini artırır ve erken aşınmaya neden olur.', suggestedAction: 'Lastik basıncını üretici değerlerine göre kontrol edin ve düzenli basınç kontrollerini alışkanlık haline getirin.', urgency: 'immediate' as const, estimatedCost: 'low' as const, safetyImpact: 'significant' as const, maintenanceType: 'adjustment' as const },
      { keyword: 'old', type: 'eskime', severity: 'medium' as const, description: 'Lastik eskime belirtileri gösteriyor, bu durum kauçuk esnekliğinin azalmasına ve yol tutuşun zayıflamasına neden olur.', suggestedAction: 'Üretim tarihini kontrol edin ve 5 yıldan eskiyse değişim planlaması yapın.', urgency: 'soon' as const, estimatedCost: 'medium' as const, safetyImpact: 'moderate' as const, maintenanceType: 'monitoring' as const },
      { keyword: 'dirty', type: 'kir', severity: 'low' as const, description: 'Lastik üzerinde aşırı kir birikimi mevcut, bu durum düzenli kontrolleri zorlaştırabilir.', suggestedAction: 'Lastik ve jantları düzenli olarak temizleyin, özellikle balçık ve katılaşmış kiri uzaklaştırın.', urgency: 'optional' as const, estimatedCost: 'low' as const, safetyImpact: 'minor' as const, maintenanceType: 'monitoring' as const },
      { keyword: 'rust', type: 'pas', severity: 'medium' as const, description: 'Jant kısmında paslanma tespit edildi, pas zamanla jant bütünlüğünü etkileyebilir.', suggestedAction: 'Jant yüzeyindeki pası giderin ve koruyucu bir kaplama uygulayın.', urgency: 'soon' as const, estimatedCost: 'medium' as const, safetyImpact: 'moderate' as const, maintenanceType: 'repair' as const },
      { keyword: 'fade', type: 'solma', severity: 'low' as const, description: 'Lastik renginde solma görülüyor, bu genellikle UV maruziyeti sebebiyle oluşur.', suggestedAction: 'Lastik koruyucu ürünler kullanın ve mümkünse aracı güneş altında uzun süre bırakmayın.', urgency: 'optional' as const, estimatedCost: 'low' as const, safetyImpact: 'minor' as const, maintenanceType: 'monitoring' as const },
      { keyword: 'wear', type: 'aşınma', severity: 'medium' as const, description: 'Lastik yüzeyinde düzensiz aşınma tespit edildi, bu durum mekanik sorunların göstergesi olabilir.', suggestedAction: 'Rot balans ayarlarını kontrol ettirin ve düzenli lastik rotasyonu yaptırın.', urgency: 'soon' as const, estimatedCost: 'medium' as const, safetyImpact: 'moderate' as const, maintenanceType: 'adjustment' as const },
      { keyword: 'thin', type: 'diş derinliği', severity: 'high' as const, description: 'Diş derinliği kritik seviyede düşük, bu durum özellikle ıslak zeminde ciddi tehlike oluşturur.', suggestedAction: 'En kısa sürede lastik değişimi yapın, yasal sınır 1.6mm olmakla birlikte güvenlik için 3mm altındaki lastikleri değiştirin.', urgency: 'immediate' as const, estimatedCost: 'high' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
      { keyword: 'bald', type: 'dişsiz bölge', severity: 'high' as const, description: 'Lastikte dişsiz bölgeler tespit edildi, bu durum frenleme mesafesini önemli ölçüde artırır.', suggestedAction: 'Acil lastik değişimi gereklidir, bu durumda aracı kullanmak güvenli değildir.', urgency: 'immediate' as const, estimatedCost: 'high' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
      { keyword: 'puncture', type: 'delinme', severity: 'high' as const, description: 'Lastik üzerinde delinme tespit edildi, delinme hızlı basınç kaybına neden olabilir.', suggestedAction: 'Delinmenin yerine ve büyüklüğüne göre tamir veya değişim kararı için uzmana danışın.', urgency: 'immediate' as const, estimatedCost: 'medium' as const, safetyImpact: 'critical' as const, maintenanceType: 'repair' as const },
      { keyword: 'tear', type: 'yırtılma', severity: 'high' as const, description: 'Lastik yüzeyinde yırtılma tespit edildi, yırtılma lastiğin iç yapısının bozulması anlamına gelir.', suggestedAction: 'Lastiğin değiştirilmesi gereklidir, bu tür hasarlar tamir edilemez.', urgency: 'immediate' as const, estimatedCost: 'high' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
      { keyword: 'bulge', type: 'şişme', severity: 'high' as const, description: 'Lastik yüzeyinde şişme/balon tespit edildi, bu durum iç katmanların zarar gördüğünü gösterir.', suggestedAction: 'Acil lastik değişimi gereklidir, şişmiş lastik ani patlama riski taşır.', urgency: 'immediate' as const, estimatedCost: 'high' as const, safetyImpact: 'critical' as const, maintenanceType: 'replacement' as const },
    ];

    // Etiketleri kontrol et ve sorunları tespit et
    for (const tag of tags) {
      const tagName = tag.name.toLowerCase();
      const confidence = tag.confidence || 0.5;
      
      // Confidence belirli bir eşiğin üzerindeyse sorun olarak değerlendir
      if (confidence >= 0.4) { // %40 ve üzeri güvenilirlikte etiketleri dikkate al
        // Eşleşen sorunları bul
        for (const mapping of problemMappings) {
          if (tagName.includes(mapping.keyword)) {
            // Sorun nesnesini oluştur
            const problem: Problem = {
              type: mapping.type,
              confidence: parseFloat(confidence.toFixed(2)),
              severity: mapping.severity as 'low' | 'medium' | 'high',
              description: mapping.description,
              suggestedAction: mapping.suggestedAction,
              urgency: mapping.urgency as 'immediate' | 'soon' | 'monitor' | 'optional',
              estimatedCost: mapping.estimatedCost as 'low' | 'medium' | 'high',
              safetyImpact: mapping.safetyImpact as 'critical' | 'significant' | 'moderate' | 'minor',
              maintenanceType: mapping.maintenanceType as 'replacement' | 'repair' | 'adjustment' | 'monitoring'
            };
            
            // İzleme/monitor özel durumu için urgency ve maintenanceType uyumunu sağla
            if (problem.urgency === 'monitor' && problem.maintenanceType !== 'monitoring') {
              problem.maintenanceType = 'monitoring';
            }
            if (problem.maintenanceType === 'monitoring' && problem.urgency !== 'monitor') {
              problem.urgency = 'monitor';
            }
            
            // Lokasyon bilgisi ekle (eğer varsa)
            if (tag.region) {
              problem.location = 'Lastik yüzeyi';
            }
            
            // Aynı tür sorunu mükerrer eklemeyi önle
            if (!detectedProblems.some(p => p.type === problem.type)) {
              detectedProblems.push(problem);
              console.log(`Detected problem: ${problem.type} (confidence: ${problem.confidence})`);
            }
            break; // Bu etiket için bir sorun oluşturuldu, sonraki etikete geç
          }
        }
      }
    }
    
    // Görüntü açıklamaları (caption) içinde sorun belirten anahtar kelimeleri ara
    if (visionData.description && visionData.description.captions && visionData.description.captions.length > 0) {
      const description = visionData.description.captions[0].text.toLowerCase();
      const captionConfidence = visionData.description.captions[0].confidence || 0.5;
      
      // Açıklamada belirli sorun ifadeleri varsa ekle
      const captionKeywords = [
        { text: 'worn', type: 'aşınma' },
        { text: 'damaged', type: 'hasar' },
        { text: 'crack', type: 'çatlak' },
        { text: 'old', type: 'eskime' },
        { text: 'aşınmış', type: 'aşınma' },
        { text: 'hasarlı', type: 'hasar' },
        { text: 'çatlak', type: 'çatlak' },
        { text: 'eski', type: 'eskime' }
      ];
      
      for (const keyword of captionKeywords) {
        if (description.includes(keyword.text) && !detectedProblems.some(p => p.type === keyword.type)) {
          // Açıklamaya göre uygun sorun tanımını bul
          const mapping = problemMappings.find(m => m.type === keyword.type);
          if (mapping) {
            const problem: Problem = {
              type: mapping.type,
              confidence: parseFloat(captionConfidence.toFixed(2)),
              severity: mapping.severity as 'low' | 'medium' | 'high',
              description: `Görsel analiz: ${mapping.description}`,
              suggestedAction: mapping.suggestedAction,
              urgency: mapping.urgency as 'immediate' | 'soon' | 'monitor' | 'optional',
              estimatedCost: mapping.estimatedCost as 'low' | 'medium' | 'high',
              safetyImpact: mapping.safetyImpact as 'critical' | 'significant' | 'moderate' | 'minor',
              maintenanceType: mapping.maintenanceType as 'replacement' | 'repair' | 'adjustment' | 'monitoring'
            };
            
            detectedProblems.push(problem);
            console.log(`Detected problem from caption: ${problem.type} (confidence: ${problem.confidence})`);
          }
        }
      }
    }
    
    // Sonuçları iade et
    return detectedProblems;
  } catch (error) {
    console.error('Error extracting negative factors from vision data:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, formData, detectOnly } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: errorMessages.missingImage }, { status: 400 });
    }

    console.log('Processing image analysis request');
    
    // Eski önbellek verilerini temizle - her yeni analiz talebi için
    if (typeof cacheAdapter !== 'undefined' && !detectOnly) {
      try {
        // Önbellek boyutunu kontrol et
        const cacheSize = await cacheAdapter.size();
        if (cacheSize > 0) {
          // Önbelleği tamamen temizle
          await cacheAdapter.clearAll();
          console.log(`[Analyze API] Cache cleared before new analysis. Previous cache size: ${cacheSize}`);
        }
      } catch (cacheError) {
        console.error('Error clearing cache:', cacheError);
        // Önbellek temizleme hatası kritik değil, analize devam et
      }
    }
    
    try {
      // 1. Görüntü analizi - temel işlev
      const analysisResult = await analyzeTireImage(imageUrl);

      // Azure Vision API'den hiç sonuç dönmediyse veya hata varsa işlemi sonlandır
      if (!analysisResult.success || !analysisResult.data) {
        return NextResponse.json({
          success: false,
          error: analysisResult.error || errorMessages.tireNotDetected
        }, { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0'
          } 
        });
      }

      // Sadece tespit işlemi isteniyorsa erken dön
      if (detectOnly) {
        return NextResponse.json({ success: analysisResult.success }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0'
          }
        });
      }
      
      // 2. Temel hesaplamaları ayrı bir fonksiyona taşıdık
      const { tireAge, baseScores, initialResult } = calculateBaseScores(formData, analysisResult.data);
      
      try {
        // 3. Tüm API çağrılarını paralel yap
        const apiResults = await runParallelApiCalls(formData, analysisResult.data, tireAge);
        
        // 4. Sonuçları uygun şekilde işle
        const enrichedResult = processApiResults(initialResult, apiResults, tireAge);
        
        // 5. Sonuçları doğrudan dön
        return NextResponse.json({ success: true, data: enrichedResult }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0', 
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0'
          }
        });
      } catch (apiError) {
        // 6. API hatalarında bile temel sonuçlarla devam et
        console.error('Error with API calls:', apiError);
        
        // Güvenlik puanını mevcut verilerle hesapla
        initialResult.safetyScore = calculateSafetyScore(
          initialResult.yasPuani,
          initialResult.kullanimPuani,
          initialResult.mevsimselPuan,
          initialResult.markaPuani,
          initialResult.gorselDurum,
          tireAge
        );
        
        // Hata mesajı ekleyerek kısmi sonuç dön
        return NextResponse.json({
          success: true, 
          data: initialResult,
          warning: 'Bazı analizler tamamlanamadı, kısmi sonuçlar gösteriliyor'
        }, { 
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0'
          }
        });
      }
    } catch (analysisError: any) {
      console.error('Analysis error:', analysisError);
      return NextResponse.json({ 
        success: false, 
        error: analysisError.message || errorMessages.analysisError 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Request error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'İstek işlenirken bir hata oluştu' 
    }, { status: 500 });
  }
}

// Temel puanları hesaplayan fonksiyon
function calculateBaseScores(formData: any, visionData: any) {
  // Temel yaş hesaplaması
      const currentYear = new Date().getFullYear();
      const tireAge = currentYear - parseInt(formData?.uretimYili || currentYear);
      
  // Temel puanları hesapla
  const visualConditionScore = calculateVisualConditionScore(visionData, tireAge, formData.lastikTipi);
      const usageScore = calculateUsageScore(formData.kilometre || '0', tireAge, visualConditionScore);
      const seasonalScore = calculateSeasonalScore(formData.lastikTipi);
      const ageScore = Math.max(0, Math.min(100, 100 - tireAge * 5));
      
  // Görüntüden tespit edilen sorunlar
  const detectedProblems = extractNegativeFactorsFromVision(visionData);
  
  // Başlangıç sonuç verileri
  const initialResult: TireAnalysisResult = {
        yasPuani: ageScore,
        kullanimPuani: usageScore,
        mevsimselPuan: seasonalScore,
        markaPuani: 85, // Geçici değer, sonra güncellenecek
        gorselDurum: visualConditionScore,
    sorunlar: detectedProblems, // Başlangıçta tespit edilen sorunları ekle
        oneriler: [],
        ozet: 'Lastik analizi tamamlandı',
        safetyScore: 80, // Geçici değer, daha sonra güncellenecek
        maintenanceNeeds: {
          immediate: [],
          soon: [],
          future: []
        },
        estimatedLifespan: {
          months: Math.max(0, 36 - tireAge * 6),
          confidence: 0.85
        }
      };

  return {
    tireAge,
    baseScores: {
      visualConditionScore,
      usageScore,
      seasonalScore,
      ageScore
    },
    initialResult
  };
}

// Paralel API çağrılarını çalıştıran fonksiyon
async function runParallelApiCalls(formData: any, visionData: any, tireAge: number) {
  // Tüm API çağrılarını paralel yap
  try {
    const [
      gptAnalysis,
      detailedProblems,
      brandScore,
      detailedAnalysis
    ] = await Promise.all([
      // Genel analiz için ChatGPT çağrısı
      getPersonalizedAnalysisFromGPT(formData, visionData, tireAge).catch(error => {
        console.error('Error in personalized analysis:', error);
        return null; // Hata durumunda null döndür ama Promise'i reddetme
      }),
      
      // Sorun analizi için ChatGPT çağrısı
      getDetailedProblemsFromGPT(formData, visionData, tireAge).catch(error => {
        console.error('Error in detailed problems analysis:', error);
        return { sorunlar: [] }; // Varsayılan değer döndür
      }),
      
      // Marka puanı hesaplama
      getBrandScoreFromGPT(
        formData.marka || 'Unknown', 
        formData.model || '', 
        formData.lastikTipi || 'dortMevsim'
      ).catch(error => {
        console.error('Error in brand score calculation:', error);
        return 75; // Varsayılan marka puanını döndür
      }),
      
      // Detaylı teknik analiz (GPT-4)
      getDetailedTechnicalAnalysis(formData, visionData, tireAge).catch(error => {
        console.error('Error in detailed technical analysis:', error);
        return ''; // Boş string döndür
      })
    ]);
    
    return {
      gptAnalysis,
      detailedProblems,
      brandScore,
      detailedAnalysis
    };
  } catch (error) {
    console.error('Error in parallel API calls:', error);
    throw error; // Hatayı yeniden fırlat, üst fonksiyon ele alacak
  }
}

// API sonuçlarını işleyen fonksiyon
function processApiResults(initialResult: TireAnalysisResult, apiResults: any, tireAge: number): TireAnalysisResult {
  const result = { ...initialResult };
  const { gptAnalysis, detailedProblems, brandScore, detailedAnalysis } = apiResults;
  
  // 1. Genel analiz sonuçlarını işle
        if (gptAnalysis) {
    // Özet bilgisi
          if (gptAnalysis.summary) {
            result.ozet = gptAnalysis.summary;
          }
          
    // Güvenlik puanı
          if (typeof gptAnalysis.safetyScore === 'number') {
            result.safetyScore = gptAnalysis.safetyScore;
          }
          
    // Tahmini ömür
          if (typeof gptAnalysis.estimatedLifespan === 'number') {
            result.estimatedLifespan.months = gptAnalysis.estimatedLifespan;
            result.estimatedLifespan.confidence = 0.92;
          }
          
    // Bakım ihtiyaçları
          if (gptAnalysis.maintenanceRecommendations) {
            if (Array.isArray(gptAnalysis.maintenanceRecommendations.immediate)) {
              result.maintenanceNeeds.immediate = gptAnalysis.maintenanceRecommendations.immediate;
            }
            if (Array.isArray(gptAnalysis.maintenanceRecommendations.soon)) {
              result.maintenanceNeeds.soon = gptAnalysis.maintenanceRecommendations.soon;
            }
            if (Array.isArray(gptAnalysis.maintenanceRecommendations.future)) {
              result.maintenanceNeeds.future = gptAnalysis.maintenanceRecommendations.future;
            }
          }
          
    // Öneriler
          if (gptAnalysis.recommendations && Array.isArray(gptAnalysis.recommendations)) {
            result.oneriler = gptAnalysis.recommendations;
          }
          else if (gptAnalysis.specialConsiderations) {
            result.oneriler = [gptAnalysis.specialConsiderations];
          }
        }
        
  // 2. Detaylı sorunları işle
        if (detailedProblems && Array.isArray(detailedProblems.sorunlar)) {
          result.sorunlar = detailedProblems.sorunlar;
        }
        
  // 3. Marka puanını ekle
  if (typeof brandScore === 'number') {
    result.markaPuani = brandScore;
  }
  
  // 4. Detaylı analizi ekle
  if (detailedAnalysis) {
    result.detayliAnaliz = detailedAnalysis;
  }
  
  // 5. Güncel değerlerle güvenlik puanını hesapla
  result.safetyScore = calculateSafetyScore(
    result.yasPuani,
    result.kullanimPuani,
    result.mevsimselPuan,
    result.markaPuani,
    result.gorselDurum,
    tireAge
  );
  
  return result;
}

// Detaylı teknik analiz çağırma fonksiyonu
async function getDetailedTechnicalAnalysis(formData: any, visionData: any, tireAge: number): Promise<string> {
  try {
    // Tam analiz için prompt
        const detailedAnalysisPrompt = `
      Aşağıdaki lastik bilgilerini kullanarak detaylı bir teknik analiz yap:
      
      Lastik Bilgileri:
      - Tip: ${formData.lastikTipi === 'yaz' ? 'Yaz Lastiği' : formData.lastikTipi === 'kis' ? 'Kış Lastiği' : 'Dört Mevsim Lastiği'}
      - Marka: ${formData.marka}
      - Model: ${formData.model || 'Belirtilmemiş'}
      - Ebat: ${formData.ebat || 'Belirtilmemiş'}
      - Üretim Yılı: ${formData.uretimYili}
      - Güncel Yaş: ${tireAge} yıl
      - Kilometre: ${formData.kilometre || 'Belirtilmemiş'}
      
      Görsel Analiz Etiketleri: ${visionData?.tags?.map((tag: any) => tag.name).join(', ')}
      
      Lütfen aşağıdaki başlıkları içeren kapsamlı bir analiz yap:
      
      1. Genel Durum Değerlendirmesi
      - Lastiğin genel durumu
      - Yaş ve kullanım etkisi
      - Mevsimsel uygunluk
      - Marka/model güvenilirliği
      
      2. Teknik Performans Analizi
      - Yol tutuş performansı
      - Fren mesafesi tahmini
      - Gürültü seviyesi
      - Yakıt tüketimine etkisi
      
      3. Güvenlik Değerlendirmesi
      - Diş derinliği durumu
      - Yanak durumu
      - Balon yapısı
      - Basınç dayanımı
      
      4. Maliyet ve Değer Analizi
      - Kalan ömür tahmini
      - Değiştirme/bakım maliyeti
      - Fiyat/performans oranı
      
      5. Özel Notlar
      - Marka/model özelinde bilinen sorunlar
      - İklim ve yol koşullarına uygunluk
      - Özel bakım tavsiyeleri
      
      Yanıtı şu JSON formatında ver:
      {
        "summary": "Tek paragraf halinde özet teknik değerlendirme",
        "overallCondition": {
          "generalState": "Genel durum açıklaması",
          "ageImpact": "Yaş etkisi analizi",
          "seasonalSuitability": "Mevsimsel uygunluk durumu",
          "brandReliability": "Marka güvenilirlik değerlendirmesi"
        },
        "technicalAnalysis": {
          "roadGrip": "Yol tutuş analizi",
          "brakingPerformance": "Fren performansı değerlendirmesi",
          "noiseLevel": "Gürültü seviyesi tahmini",
          "fuelEfficiency": "Yakıt tüketimine etkisi"
        },
        "safetyAssessment": {
          "overallScore": 0-100 arası puan,
          "treadDepth": "Diş derinliği durumu",
          "sidewallCondition": "Yanak durumu analizi",
          "structuralIntegrity": "Yapısal bütünlük değerlendirmesi",
          "pressureResistance": "Basınç dayanımı analizi"
        },
        "costValueAnalysis": {
          "remainingLifespan": {
            "months": tahmini kalan ömür (ay),
            "confidence": tahmin güvenilirliği (0-100)
          },
          "replacementCost": "düşük|orta|yüksek",
          "valueForMoney": "fiyat/performans değerlendirmesi"
        },
        "specialNotes": {
          "knownIssues": "Marka/model özelinde bilinen sorunlar",
          "climateSuitability": "İklim uygunluğu",
          "maintenanceAdvice": "Özel bakım tavsiyeleri"
        }
      }`;
    
    const detailedAnalysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o', // Daha detaylı ve doğru analiz için GPT-4 kullan
          messages: [
            { 
              role: 'system', 
          content: `Sen çok deneyimli bir lastik teknisyeni ve güvenlik uzmanısın. 
          Lastikleri teknik açıdan detaylı analiz eder, güvenlik risklerini değerlendirir ve 
          kullanıcılara profesyonel önerilerde bulunursun. Analizlerini her zaman:
          - Teknik detaylarla
          - Güvenlik odaklı
          - Maliyet-fayda perspektifiyle
          - Kullanıcı koşullarını göz önünde bulundurarak
          yaparsın.` 
            },
            { role: 'user', content: detailedAnalysisPrompt }
          ],
      temperature: 0.3, // Daha tutarlı ve teknik sonuçlar için düşük sıcaklık
          response_format: { type: "json_object" },
      max_tokens: 2000, // Daha detaylı yanıtlar için token limitini artır
        });
        
    return detailedAnalysisResponse.choices[0]?.message?.content || '';
      } catch (error) {
    console.error('Error generating detailed technical analysis:', error);
    return ''; // Hata durumunda boş string dön
  }
}

// Mevsimsel puanı hesaplayan yardımcı fonksiyon
function calculateSeasonalScore(tireType: string): number {
  const currentMonth = new Date().getMonth(); // 0 (Ocak) - 11 (Aralık)
  
  // Mevsim tespiti
  // 10, 11, 0, 1, 2: Kış (Ekim-Şubat)
  // 3, 4: İlkbahar geçiş dönemi (Mart-Nisan)
  // 5, 6, 7, 8: Yaz (Mayıs-Ağustos)
  // 9: Sonbahar geçiş dönemi (Eylül)
  
  const isWinterSeason = currentMonth < 3 || currentMonth >= 10;
  const isTransitionSeason = currentMonth === 3 || currentMonth === 4 || currentMonth === 9;
  const isSummerSeason = currentMonth >= 5 && currentMonth <= 8;
  
  if (tireType === 'dortMevsim') {
    // Dört mevsim lastikler her mevsim için uygun ancak optimal değil
    // Geçiş dönemlerinde en iyi
    if (isTransitionSeason) {
      return 95;
    } else if (isWinterSeason) {
      return 85; // Kışın kabul edilebilir
    } else {
      return 85; // Yazın kabul edilebilir
    }
  } else if (tireType === 'yaz') {
    if (isSummerSeason) {
      return 100; // Yaz lastiği yaz mevsiminde mükemmel
    } else if (isTransitionSeason) {
      return 85; // Geçiş dönemlerinde kabul edilebilir
    } else {
      return 50; // Kış mevsiminde tehlikeli
    }
  } else if (tireType === 'kis') {
    if (isWinterSeason) {
      return 100; // Kış lastiği kış mevsiminde mükemmel
    } else if (isTransitionSeason) {
      return 80; // Geçiş dönemlerinde kabul edilebilir
    } else {
      return 60; // Yaz mevsiminde tavsiye edilmez, aşırı aşınma riski
    }
  } else {
    return 80; // Bilinmeyen lastik tipi için varsayılan
  }
}

// Görsel durum puanını hesaplayan yardımcı fonksiyon
function calculateVisualConditionScore(visionData: any, tireAge: number, tireType: string): number {
  // Başlangıç puanı
  let score = 85; // Varsayılan puan

  try {
    if (!visionData || !visionData.tags) {
      console.warn('Vision data is missing or incomplete, using default score');
      return score;
    }

    // Etiketlere (tags) göre görsel durum puanını ayarla
    const tags = visionData.tags || [];
    const tagNames = tags.map((tag: any) => tag.name.toLowerCase());
    
    console.log('Vision tags for condition scoring:', tagNames.join(', '));
    
    // Negatif etiketler - puan düşürücü faktörler (İngilizce)
    const negativeFactors = [
      { keyword: 'worn', impact: -15 },       // Aşınmış lastik
      { keyword: 'damaged', impact: -20 },    // Hasarlı lastik
      { keyword: 'crack', impact: -25 },      // Çatlak
      { keyword: 'flat', impact: -10 },       // Patlak/inmiş lastik
      { keyword: 'old', impact: -10 },        // Eski görünüm
      { keyword: 'dirty', impact: -5 },       // Kirli
      { keyword: 'rust', impact: -15 },       // Pas (jant kısmında)
      { keyword: 'fade', impact: -5 },        // Solma
      { keyword: 'wear', impact: -15 },       // Aşınma
      { keyword: 'thin', impact: -20 },       // İnce diş
      { keyword: 'bald', impact: -30 },       // Dişsiz lastik
      { keyword: 'puncture', impact: -30 },   // Delinme
      { keyword: 'tear', impact: -25 },       // Yırtılma
      { keyword: 'bulge', impact: -35 },      // Şişme/balon
      { keyword: 'uneven', impact: -15 },     // Düzensiz aşınma
      { keyword: 'irregular', impact: -15 },  // Düzensiz aşınma
      { keyword: 'dry rot', impact: -40 },    // Kuru çürüme
      { keyword: 'sidewall', impact: -15 },   // Yan duvar hasarı potansiyeli
      { keyword: 'debris', impact: -5 },      // Kalıntılar
      { keyword: 'discoloration', impact: -5 } // Renk değişimi
    ];

    // Türkçe negatif etiketler
    const turkishNegativeFactors = [
      { keyword: 'aşınmış', impact: -15 },
      { keyword: 'eskimiş', impact: -15 },
      { keyword: 'hasarlı', impact: -20 },
      { keyword: 'çatlak', impact: -25 },
      { keyword: 'yırtık', impact: -25 },
      { keyword: 'patlak', impact: -30 },
      { keyword: 'delik', impact: -20 },
      { keyword: 'kirli', impact: -5 },
      { keyword: 'eski', impact: -10 },
      { keyword: 'paslı', impact: -15 },
      { keyword: 'solmuş', impact: -5 },
      { keyword: 'kabarık', impact: -35 },
      { keyword: 'şişkin', impact: -35 },
      { keyword: 'inmiş', impact: -10 },
      { keyword: 'düzensiz', impact: -15 },
      { keyword: 'çürük', impact: -40 },
      { keyword: 'çürüme', impact: -40 },
      { keyword: 'kopuk', impact: -30 },
      { keyword: 'kesik', impact: -25 },
      { keyword: 'yamuk', impact: -15 },
      { keyword: 'deforme', impact: -25 },
      { keyword: 'düz', impact: -20 }
    ];

    // Pozitif etiketler - puan artırıcı faktörler (İngilizce)
    const positiveFactors = [
      { keyword: 'new', impact: 10 },         // Yeni lastik
      { keyword: 'clean', impact: 5 },        // Temiz
      { keyword: 'shiny', impact: 5 },        // Parlak
      { keyword: 'good', impact: 8 },         // İyi durumda
      { keyword: 'even', impact: 5 },         // Düzgün aşınma
      { keyword: 'deep', impact: 8 },         // Derin diş
      { keyword: 'tread', impact: 5 },        // Diş
      { keyword: 'balanced', impact: 5 },     // Dengeli
      { keyword: 'inflated', impact: 5 },     // Şişirilmiş
      { keyword: 'proper', impact: 5 },       // Uygun
      { keyword: 'excellent', impact: 12 },   // Mükemmel
      { keyword: 'mint', impact: 15 },        // Çok iyi durumda
      { keyword: 'perfect', impact: 15 },     // Mükemmel durumda
      { keyword: 'smooth', impact: 5 },       // Pürüzsüz
      { keyword: 'fresh', impact: 8 }         // Taze/yeni
    ];

    // Türkçe pozitif etiketler
    const turkishPositiveFactors = [
      { keyword: 'yeni', impact: 10 },
      { keyword: 'temiz', impact: 5 },
      { keyword: 'parlak', impact: 5 },
      { keyword: 'iyi', impact: 8 },
      { keyword: 'düzgün', impact: 5 },
      { keyword: 'derin', impact: 8 },
      { keyword: 'dengeli', impact: 5 },
      { keyword: 'mükemmel', impact: 12 },
      { keyword: 'kusursuz', impact: 15 },
      { keyword: 'pürüzsüz', impact: 5 },
      { keyword: 'taze', impact: 8 },
      { keyword: 'sağlam', impact: 7 },
      { keyword: 'bakımlı', impact: 6 }
    ];

    // Lastik parçaları için ağırlıklı faktör tanımları
    const tirePartKeywords = [
      { keyword: 'tread', weight: 2.0 },      // Diş deseni en önemli
      { keyword: 'sidewall', weight: 1.5 },   // Yan duvar
      { keyword: 'shoulder', weight: 1.2 },   // Omuz
      { keyword: 'bead', weight: 1.0 },       // Topuk
      { keyword: 'groove', weight: 1.8 },     // Oluk
      { keyword: 'pattern', weight: 1.3 },    // Desen
      { keyword: 'diş', weight: 2.0 },        // Türkçe: Diş
      { keyword: 'yan', weight: 1.5 },        // Türkçe: Yan duvar
      { keyword: 'omuz', weight: 1.2 },       // Türkçe: Omuz
      { keyword: 'topuk', weight: 1.0 },      // Türkçe: Topuk
      { keyword: 'oluk', weight: 1.8 },       // Türkçe: Oluk
      { keyword: 'desen', weight: 1.3 }       // Türkçe: Desen
    ];
    
    // Etiketlerin etkisini hesapla
    let negativeImpact = 0;
    let positiveImpact = 0;
    let factorCount = 0;

    // Tag güven faktörü
    for (const tag of tags) {
      const tagName = tag.name.toLowerCase();
      const confidence = tag.confidence || 0.5;
      
      // Lastik parçası ağırlık faktörü
      let partWeight = 1.0; // Varsayılan ağırlık
      
      // Eğer tanımlanan lastik parçalarından biri varsa, o parçanın ağırlığını kullan
      for (const part of tirePartKeywords) {
        if (tagName.includes(part.keyword)) {
          partWeight = part.weight;
          console.log(`Part weight for ${tagName}: ${partWeight}`);
          break;
        }
      }
      
      // İngilizce negatif faktörleri kontrol et
      for (const factor of negativeFactors) {
        if (tagName.includes(factor.keyword)) {
          // Güven faktörüne göre etki seviyesini ve parça ağırlığını dikkate alarak ayarla
          const impact = factor.impact * confidence * partWeight;
          negativeImpact += impact;
          factorCount++;
          console.log(`Negative factor: ${tagName} (${factor.keyword}), impact: ${impact} (weight: ${partWeight})`);
        }
      }
      
      // Türkçe negatif faktörleri kontrol et
      for (const factor of turkishNegativeFactors) {
        if (tagName.includes(factor.keyword)) {
          const impact = factor.impact * confidence * partWeight;
          negativeImpact += impact;
          factorCount++;
          console.log(`Negative TR factor: ${tagName} (${factor.keyword}), impact: ${impact} (weight: ${partWeight})`);
        }
      }
      
      // İngilizce pozitif faktörleri kontrol et
      for (const factor of positiveFactors) {
        if (tagName.includes(factor.keyword)) {
          const impact = factor.impact * confidence * partWeight;
          positiveImpact += impact;
          factorCount++;
          console.log(`Positive factor: ${tagName} (${factor.keyword}), impact: ${impact} (weight: ${partWeight})`);
        }
      }
      
      // Türkçe pozitif faktörleri kontrol et
      for (const factor of turkishPositiveFactors) {
        if (tagName.includes(factor.keyword)) {
          const impact = factor.impact * confidence * partWeight;
          positiveImpact += impact;
          factorCount++;
          console.log(`Positive TR factor: ${tagName} (${factor.keyword}), impact: ${impact} (weight: ${partWeight})`);
        }
      }
    }
    
    // Faktör sayısına göre etki ölçeklendirme
    if (factorCount > 0) {
      const scaledNegative = negativeImpact;
      const scaledPositive = positiveImpact;
      
      score += scaledPositive + scaledNegative;
      console.log(`Score after tag analysis: ${score} (positive: ${scaledPositive}, negative: ${scaledNegative})`);
    }
    
    // Görüntü açıklamasını (description) analiz et
    if (visionData.description && visionData.description.captions && visionData.description.captions.length > 0) {
      const description = visionData.description.captions[0].text.toLowerCase();
      const captionConfidence = visionData.description.captions[0].confidence || 0.5;
      
      // İngilizce açıklamalar - güven oranıyla ağırlıklandır
      if (description.includes('worn') || description.includes('old')) {
        const impact = -10 * captionConfidence;
        score += impact;
        console.log(`Description mentions worn/old, ${impact} points (confidence: ${captionConfidence})`);
      }
      
      if (description.includes('new') || description.includes('good condition')) {
        const impact = 10 * captionConfidence;
        score += impact;
        console.log(`Description mentions new/good condition, +${impact} points (confidence: ${captionConfidence})`);
      }
      
      if (description.includes('damage') || description.includes('crack')) {
        const impact = -15 * captionConfidence;
        score += impact;
        console.log(`Description mentions damage/crack, ${impact} points (confidence: ${captionConfidence})`);
      }
      
      // Türkçe açıklamalar
      if (description.includes('aşınmış') || description.includes('eski')) {
        const impact = -10 * captionConfidence;
        score += impact;
        console.log(`Description mentions aşınmış/eski, ${impact} points (confidence: ${captionConfidence})`);
      }
      
      if (description.includes('yeni') || description.includes('iyi durumda')) {
        const impact = 10 * captionConfidence;
        score += impact;
        console.log(`Description mentions yeni/iyi durumda, +${impact} points (confidence: ${captionConfidence})`);
      }
      
      if (description.includes('hasar') || description.includes('çatlak')) {
        const impact = -15 * captionConfidence;
        score += impact;
        console.log(`Description mentions hasar/çatlak, ${impact} points (confidence: ${captionConfidence})`);
      }
    }
    
    // Lastik yaşına göre puanı ayarla (daha hafif bir etki)
    if (tireAge > 0) {
      // Yaşın görsel durum puanına etkisini azaltıyoruz
      // 0-3 yıl: etki yok
      // 3-6 yıl: her yıl -1 puan
      // 6-10 yıl: her yıl -1.5 puan
      // 10+ yıl: her yıl -2 puan (maksimum -20 puan)
      let ageImpact = 0;
      
      if (tireAge > 10) {
        // 10 yıldan sonraki etki daha sınırlı, maksimum -20 puan
        ageImpact = Math.max(-20, -((tireAge - 10) * 2 + 10.5));
      } else if (tireAge > 6) {
        ageImpact = -((tireAge - 6) * 1.5 + 3);  // 6-10 yıl arası
      } else if (tireAge > 3) {
        ageImpact = -((tireAge - 3) * 1);        // 3-6 yıl arası
      }
      
      score += ageImpact;
      console.log(`Age impact (reduced effect, ${tireAge} years): ${ageImpact}, new score: ${score}`);
    }
    
    // Kilometre verisine göre puanı ayarla
    // ...bu kısım ileride eklenebilir
    
    // Lastik tipine göre mevsimsel uyumluluk
    const currentMonth = new Date().getMonth(); // 0 (Ocak) - 11 (Aralık)
    const isWinterSeason = currentMonth < 3 || currentMonth >= 10; // Ekim-Mart arası kış sezonu
    
    if (isWinterSeason && tireType === 'yaz') {
      score -= 5; // Kış mevsiminde yaz lastiği
      console.log('Winter season with summer tire, -5 points');
    } else if (!isWinterSeason && tireType === 'kis') {
      score -= 5; // Yaz mevsiminde kış lastiği
      console.log('Summer season with winter tire, -5 points');
    } else {
      // Mevsime uygun lastik
      score += 2;
      console.log('Season-appropriate tire, +2 points');
    }
    
    // Puanı sınırla ve yuvarla
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    console.log(`Final visual condition score: ${finalScore}`);
    return finalScore;
  } catch (error) {
    console.error('Error calculating visual condition score:', error);
    return 80; // Hata durumunda varsayılan puan
  }
} 