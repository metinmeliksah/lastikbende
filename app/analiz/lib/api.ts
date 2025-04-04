/**
 * LastikBende API Client
 * Tüm API istekleri için merkezi nokta
 */

// Analiz API için tipleri tanımla
export interface AnalizFormData {
  lastikBilgileri: {
    marka: string;
    model: string;
    boyut: string;
    uretimYili?: number;
    kilometre?: number;
  };
  analizSonuclari: {
    genelDurum: string;
    disDerinligi: number;
    yanakDurumu: string;
    asinmaOrani: number;
    guvenlikSkoru: number;
  };
  tahminiBilgiler: {
    tahminiOmur: {
      km: number;
      ay: number;
    };
    onerilenBakimlar: string[];
    sorunlar: {
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }[];
  };
  metaVeriler?: {
    analizTarihi: Date;
    raporId: string;
    surumNo: string;
  };
}

// API hata türleri için arayüz tanımı
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

// Standart API hata düzenleyici
export function handleApiError(error: any): ApiError {
  console.error('API hatası:', error);
  
  // Axios hatası ise daha spesifik bilgiler çıkar
  if (error.response) {
    // Sunucu yanıt döndü fakat başarılı değil (4xx, 5xx)
    return {
      code: error.response.data?.code || 'SERVER_ERROR',
      message: error.response.data?.message || 'Sunucu hatası oluştu',
      details: error.response.data?.details,
      status: error.response.status
    };
  } else if (error.request) {
    // İstek yapıldı ama yanıt alınamadı
    return {
      code: 'NETWORK_ERROR',
      message: 'Sunucuyla bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.',
      status: 0
    };
  } else {
    // İstek oluşturulurken bir hata oluştu
    return {
      code: 'REQUEST_ERROR',
      message: error.message || 'İstek oluşturulurken bir hata meydana geldi',
      status: 0
    };
  }
}

// Analiz API client
export const analizApi = {
  /**
   * Lastik resmi yükler ve analiz eder
   */
  analyzeImage: async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch('/api/analiz/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata oluştu' }));
        throw new Error(errorData.error || 'Resim analizi sırasında bir hata oluştu');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Resim analizi hatası:', error);
      throw new Error(error.message || 'Resim analizi sırasında bir hata oluştu');
    }
  },

  /**
   * Analiz verilerini işler ve değerlendirir
   */
  processAnalysis: async (data: any): Promise<any> => {
    try {
      const response = await fetch('/api/analiz/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata oluştu' }));
        throw new Error(errorData.error || 'Analiz işleme sırasında bir hata oluştu');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Analiz işleme hatası:', error);
      throw new Error(error.message || 'Analiz işleme sırasında bir hata oluştu');
    }
  }
};

// Export API client
export const exportApi = {
  /**
   * Analiz sonuçlarını PDF formatında dışa aktarır
   * @param data Analiz verileri
   * @param forPrinting Yazdırma için optimize edilmiş PDF mi?
   * @param onProgress İlerleme durumunu bildiren callback
   */
  exportToPdf: async (
    data: AnalizFormData, 
    forPrinting: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    try {
      // İlerleme durumunu başlat
      if (onProgress) onProgress(10);
      
      const url = `/analiz/api/export/pdf`;
      
      // Yazdırma için özel querystring ekle
      const finalUrl = forPrinting ? `${url}?forPrinting=true` : url;
      
      // İstek yapılıyor durumunu bildir
      if (onProgress) onProgress(30);
      
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // İşleme durumunu bildir
      if (onProgress) onProgress(80);

      if (!response.ok) {
        const errorData = await response.json()
          .catch(() => ({ error: 'PDF oluşturulurken bilinmeyen bir hata oluştu' }));
        throw new Error(errorData.error || `PDF oluşturulurken bir hata oluştu: ${response.status}`);
      }
      
      // Tamamlandı durumunu bildir
      if (onProgress) onProgress(100);
      
      return await response.blob();
    } catch (error: any) {
      console.error('PDF dışa aktarma hatası:', error);
      throw error;
    }
  },

  /**
   * Analiz sonuçlarını Word formatında dışa aktarır
   * @param data Analiz verileri
   * @param onProgress İlerleme durumunu bildiren callback
   */
  exportToWord: async (
    data: AnalizFormData,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    try {
      // İlerleme durumunu başlat
      if (onProgress) onProgress(10);
      
      const response = await fetch('/analiz/api/export/word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // İşleme durumunu bildir
      if (onProgress) onProgress(80);

      if (!response.ok) {
        const errorData = await response.json()
          .catch(() => ({ error: 'Word belgesi oluşturulurken bilinmeyen bir hata oluştu' }));
        throw new Error(errorData.error || `Word belgesi oluşturulurken bir hata oluştu: ${response.status}`);
      }
      
      // Tamamlandı durumunu bildir
      if (onProgress) onProgress(100);
      
      return await response.blob();
    } catch (error: any) {
      console.error('Word dışa aktarma hatası:', error);
      throw error;
    }
  },

  /**
   * Analiz sonuçlarını Excel formatında dışa aktarır
   * @param data Analiz verileri
   * @param onProgress İlerleme durumunu bildiren callback
   */
  exportToExcel: async (
    data: AnalizFormData,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    try {
      // İlerleme durumunu başlat
      if (onProgress) onProgress(10);
      
      const response = await fetch('/analiz/api/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // İşleme durumunu bildir
      if (onProgress) onProgress(80);

      if (!response.ok) {
        const errorData = await response.json()
          .catch(() => ({ error: 'Excel belgesi oluşturulurken bilinmeyen bir hata oluştu' }));
        throw new Error(errorData.error || `Excel belgesi oluşturulurken bir hata oluştu: ${response.status}`);
      }
      
      // Tamamlandı durumunu bildir
      if (onProgress) onProgress(100);
      
      return await response.blob();
    } catch (error: any) {
      console.error('Excel dışa aktarma hatası:', error);
      throw error;
    }
  }
};

// Yardımcı fonksiyonlar
async function exportFile(data: AnalizFormData, format: 'pdf' | 'word' | 'excel', forPrinting: boolean = false): Promise<Blob> {
  try {
    const url = `/analiz/api/export/${format}`;
    
    // Yazdırma için özel querystring ekle
    const finalUrl = forPrinting ? `${url}?forPrinting=true` : url;
    
    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata oluştu' }));
      throw new Error(errorData.error || `${format.toUpperCase()} oluşturulurken bir hata oluştu`);
    }

    return await response.blob();
  } catch (error: any) {
    console.error(`${format} dışa aktarma hatası:`, error);
    throw new Error(error.message || `${format.toUpperCase()} dışa aktarma sırasında bir hata oluştu`);
  }
} 