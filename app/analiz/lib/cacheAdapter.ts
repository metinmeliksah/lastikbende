/**
 * Cache Adapter - Önbellekleme yönetimi için basit bir ara katman
 * 
 * Özellikle PDF oluşturma gibi yoğun işlemler için verimliliği artırır.
 */

type CacheItem = {
  value: Buffer | string; // Önbelleklenmiş veri
  expiry: number;         // Önbellek süresinin sona ereceği zaman (Unix timestamp)
};

// In-memory önbellekleme için basit Map kullanımı
const cache = new Map<string, CacheItem>();

// Önbellek süresi varsayılanları (saniye cinsinden)
const DEFAULT_TTL = 3600; // 1 saat

// Önbellek anahtarı önekleri
const CACHE_PREFIXES = {
  PDF: 'pdf_',
  ANALYSIS: 'analysis_',
  IMAGE: 'image_'
};

/**
 * Cache Adapter
 */
export const cacheAdapter = {
  /**
   * Önbellekten veri almak için
   * @param key Önbellek anahtarı
   * @returns Önbellekteki veri veya null (bulunamazsa ya da süresi geçmişse)
   */
  async get(key: string): Promise<Buffer | string | null> {
    const item = cache.get(key);
    
    // Önbellekte yok veya süresi dolmuş
    if (!item || Date.now() > item.expiry) {
      if (item) {
        // Süresi dolmuş öğeyi temizle
        cache.delete(key);
      }
      return null;
    }
    
    return item.value;
  },
  
  /**
   * Veriyi önbelleğe kaydetmek için
   * @param key Önbellek anahtarı
   * @param value Önbelleğe alınacak veri (Buffer veya string)
   * @param ttlSeconds Verilerin önbellekte tutulacağı süre (saniye cinsinden)
   */
  async set(key: string, value: Buffer | string, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const expiry = Date.now() + (ttlSeconds * 1000);
    cache.set(key, { value, expiry });
    
    // Otomatik önbellek temizleme
    setTimeout(() => {
      if (cache.has(key)) {
        const item = cache.get(key)!;
        if (Date.now() > item.expiry) {
          cache.delete(key);
        }
      }
    }, ttlSeconds * 1000);
  },

  /**
   * Belirli bir önbellek anahtarını temizlemek için
   * @param key Temizlenecek önbellek anahtarı
   */
  async clear(key: string): Promise<void> {
    if (cache.has(key)) {
      cache.delete(key);
    }
  },

  /**
   * Belirli bir önek ile başlayan tüm önbellek anahtarlarını temizler
   * @param prefix Temizlenecek önbellek anahtarlarının öneki
   */
  async clearByPrefix(prefix: string): Promise<void> {
    Array.from(cache.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    });
    console.log(`[Cache] Cleared all cache items with prefix: ${prefix}`);
  },

  /**
   * Tüm önbelleği temizlemek için
   * Sayfa yenilendiğinde veya oturum sonlandığında kullanışlı
   * Kullanıcı oturumunu etkilemeyecek şekilde tasarlandı
   */
  async clearAll(): Promise<void> {
    // Sadece uygulama önbelleğini temizle, oturum verilerini koru
    Array.from(cache.keys()).forEach(key => {
      if (Object.values(CACHE_PREFIXES).some(prefix => key.startsWith(prefix))) {
        cache.delete(key);
      }
    });
    console.log('[Cache] All application cache data has been cleared.');
  },

  /**
   * Önbellekteki öğelerin sayısını almak için 
   * @returns Önbellekteki öğe sayısı
   */
  async size(): Promise<number> {
    return cache.size;
  }
};

// Basit bir sayfa yenileme veya oturum kapatma olayı algılayıcısı
// Bu kod tarayıcıda çalıştığında önbelleği temizler
if (typeof window !== 'undefined') {
  // Sayfa yenilenirken veya kapatılırken
  window.addEventListener('beforeunload', () => {
    // Sadece uygulama önbelleğini temizle
    cacheAdapter.clearByPrefix(CACHE_PREFIXES.PDF);
    cacheAdapter.clearByPrefix(CACHE_PREFIXES.ANALYSIS);
    cacheAdapter.clearByPrefix(CACHE_PREFIXES.IMAGE);
  });
}

// Yardımcı fonksiyonlar
export const createCacheKey = (prefix: string, data: any): string => {
  // JSON.stringify ile veriyi serialize et ve hash oluştur
  let stringified = '';
  
  try {
    // Döngüsel referansları önlemek için 
    const seen = new WeakSet();
    stringified = JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (err) {
    // Serialize edilemeyen veri için hash oluşturulamaz
    console.warn('Cache key creation error:', err);
    return `${prefix}_${Date.now()}`;
  }
  
  // Basit bir hash (geliştirilebilir)
  const hash = stringified
    .split('')
    .reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
    }, 0)
    .toString(36);
  
  return `${prefix}_${hash}`;
};