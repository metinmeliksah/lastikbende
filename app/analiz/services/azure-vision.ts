import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { ImageTag, DetectedObject } from '@azure/cognitiveservices-computervision/esm/models';

// Türkçe hata ve bilgi mesajları
const errorMessages = {
  noTireDetected: 'Lastik tespit edilemedi. Lütfen daha net bir fotoğraf yükleyin.',
  processingError: 'Görüntü analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
  unknownError: 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  apiError: 'API bağlantı hatası. Lütfen daha sonra tekrar deneyin.'
};

// English to Turkish translations for common tire-related terms
const translations = {
  tire: 'lastik',
  wheel: 'teker',
  worn: 'aşınmış',
  new: 'yeni',
  damaged: 'hasarlı',
  good_condition: 'iyi durumda',
  'Image of': 'Görüntü:',
  'No tire detected': 'Lastik tespit edilemedi',
  'Please upload a clearer image': 'Lütfen daha net bir fotoğraf yükleyin',
  'Error during image analysis': 'Görüntü analizi sırasında bir hata oluştu',
  'Unknown error': 'Bilinmeyen hata'
};

function translateText(text: string): string {
  if (!text) return '';
  let translatedText = text.toLowerCase();
  
  Object.entries(translations).forEach(([eng, tr]) => {
    translatedText = translatedText.replace(new RegExp(eng, 'gi'), tr);
  });
  
  return translatedText;
}

// Client-side ve server-side için farklı yöntemler kullanacağız
let computerVisionClient: ComputerVisionClient | null = null;

// Sadece client-side için çalışacak
function isClientSide(): boolean {
  return typeof window !== 'undefined';
}

export async function analyzeTireImage(imageUrl: string) {
  try {
    // Her istek için yeni client oluştur
    const computerVisionKey = process.env.AZURE_VISION_KEY || process.env.NEXT_PUBLIC_AZURE_VISION_KEY;
    const computerVisionEndpoint = process.env.AZURE_VISION_ENDPOINT || process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT;
    
    if (!computerVisionKey || !computerVisionEndpoint) {
      console.error('Azure Vision credentials are missing');
      return {
        success: false,
        error: errorMessages.apiError
      };
    }
    
    const client = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': computerVisionKey } }),
      computerVisionEndpoint
    );

    let processedImageUrl = imageUrl;
    if (imageUrl.startsWith('data:image')) {
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // English API communication
      const result = await client.analyzeImageInStream(buffer, {
        visualFeatures: [
          'Objects',
          'Tags',
          'Description',
          'Color',
          'Brands'
        ],
        details: ['Landmarks'],
        language: 'en'
      });

      // Check for tire-related features in English
      const tireTags = (result.tags || [])
        .filter((tag: ImageTag) => {
          const tagName = tag.name?.toLowerCase() || '';
          return tagName.includes('tire') || 
                 tagName.includes('wheel');
        });

      const tireObjects = (result.objects || [])
        .filter((obj: DetectedObject) => {
          const objName = obj.object?.toLowerCase() || '';
          return objName.includes('tire') || 
                 objName.includes('wheel');
        });

      if (tireTags.length === 0 && tireObjects.length === 0) {
        console.log('No tire detected in the image');
        return {
          success: false,
          error: errorMessages.noTireDetected
        };
      }

      // Translate results to Turkish
      return {
        success: true,
        data: {
          description: translateText(result.description?.captions?.[0]?.text || ''),
          tags: tireTags.map((tag: ImageTag) => ({
            ...tag,
            name: translateText(tag.name || '')
          })),
          objects: tireObjects.map((obj: DetectedObject) => ({
            ...obj,
            object: translateText(obj.object || '')
          })),
          colors: result.color,
          brands: result.brands,
          rawAnalysis: result
        }
      };
    } else {
      // URL based image analysis
      const result = await client.analyzeImage(processedImageUrl, {
        visualFeatures: [
          'Objects',
          'Tags',
          'Description',
          'Color',
          'Brands'
        ],
        details: ['Landmarks'],
        language: 'en'
      });

      // Check for tire-related features in English
      const tireTags = (result.tags || [])
        .filter((tag: ImageTag) => {
          const tagName = tag.name?.toLowerCase() || '';
          return tagName.includes('tire') || 
                 tagName.includes('wheel');
        });

      const tireObjects = (result.objects || [])
        .filter((obj: DetectedObject) => {
          const objName = obj.object?.toLowerCase() || '';
          return objName.includes('tire') || 
                 objName.includes('wheel');
        });

      if (tireTags.length === 0 && tireObjects.length === 0) {
        console.log('No tire detected in the image');
        return {
          success: false,
          error: errorMessages.noTireDetected
        };
      }

      // Translate results to Turkish
      return {
        success: true,
        data: {
          description: translateText(result.description?.captions?.[0]?.text || ''),
          tags: tireTags.map((tag: ImageTag) => ({
            ...tag,
            name: translateText(tag.name || '')
          })),
          objects: tireObjects.map((obj: DetectedObject) => ({
            ...obj,
            object: translateText(obj.object || '')
          })),
          colors: result.color,
          brands: result.brands,
          rawAnalysis: result
        }
      };
    }
  } catch (error: any) {
    console.error('Azure Vision analysis error:', error);
    return {
      success: false,
      error: errorMessages.processingError
    };
  }
} 