import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FormData } from '../types';
import Image from 'next/image';
import { ShieldCheck, ShoppingCart, ThumbsUp } from 'lucide-react';

interface LastikOnerisi {
  id: string;
  marka: string;
  model: string;
  ebat: string;
  lastikTipi: string;
  fiyat: number;
  gorselUrl: string;
  guvenirlikPuani: number;
  ozellikler: string[];
  uygunlukPuani: number;
  mevsim?: 'yaz' | 'kis' | 'dortMevsim';
  performansSeviyesi?: 'ekonomik' | 'orta' | 'premium';
}

interface AiOnerisiSectionProps {
  formData: FormData;
  t?: any;
}

// Örnek lastik verileri
const tumLastikler: LastikOnerisi[] = [
  {
    id: '1',
    marka: 'Michelin',
    model: 'Pilot Sport 4',
    ebat: '225/45R17',
    lastikTipi: 'yaz',
    fiyat: 4999,
    gorselUrl: '/images/tires/michelin-pilot.jpg',
    guvenirlikPuani: 98,
    ozellikler: ['Yüksek Performans', 'Islak Zeminde Üstün Tutuş'],
    uygunlukPuani: 0,
    mevsim: 'yaz',
    performansSeviyesi: 'premium'
  },
  {
    id: '2',
    marka: 'Continental',
    model: 'PremiumContact 6',
    ebat: '225/45R17',
    lastikTipi: 'yaz',
    fiyat: 4599,
    gorselUrl: '/images/tires/continental-premium.jpg',
    guvenirlikPuani: 96,
    ozellikler: ['Dengeli Performans', 'Düşük Yuvarlanma Direnci'],
    uygunlukPuani: 0,
    mevsim: 'yaz',
    performansSeviyesi: 'premium'
  },
  {
    id: '3',
    marka: 'Bridgestone',
    model: 'Turanza T005',
    ebat: '225/45R17',
    lastikTipi: 'yaz',
    fiyat: 4299,
    gorselUrl: '/images/tires/bridgestone-turanza.jpg',
    guvenirlikPuani: 95,
    ozellikler: ['Konforlu Sürüş', 'Uzun Ömür'],
    uygunlukPuani: 0,
    mevsim: 'yaz',
    performansSeviyesi: 'premium'
  },
  {
    id: '4',
    marka: 'Goodyear',
    model: 'EfficientGrip Performance 2',
    ebat: '225/45R17',
    lastikTipi: 'yaz',
    fiyat: 4199,
    gorselUrl: '/images/tires/goodyear-efficient.jpg',
    guvenirlikPuani: 94,
    ozellikler: ['Yakıt Tasarrufu', 'Sessiz Sürüş'],
    uygunlukPuani: 0,
    mevsim: 'yaz',
    performansSeviyesi: 'premium'
  },
  {
    id: '5',
    marka: 'Pirelli',
    model: 'Cinturato P7',
    ebat: '225/45R17',
    lastikTipi: 'yaz',
    fiyat: 4399,
    gorselUrl: '/images/tires/pirelli-cinturato.jpg',
    guvenirlikPuani: 95,
    ozellikler: ['Sportif Sürüş', 'Yüksek Konfor'],
    uygunlukPuani: 0,
    mevsim: 'yaz',
    performansSeviyesi: 'premium'
  },
  // Kış lastikleri
  {
    id: '6',
    marka: 'Michelin',
    model: 'Alpin 6',
    ebat: '225/45R17',
    lastikTipi: 'kis',
    fiyat: 4799,
    gorselUrl: '/images/tires/michelin-alpin.jpg',
    guvenirlikPuani: 97,
    ozellikler: ['Kış Performansı', 'Kar ve Buz Tutuşu'],
    uygunlukPuani: 0,
    mevsim: 'kis',
    performansSeviyesi: 'premium'
  },
  {
    id: '7',
    marka: 'Continental',
    model: 'WinterContact TS 870',
    ebat: '225/45R17',
    lastikTipi: 'kis',
    fiyat: 4599,
    gorselUrl: '/images/tires/continental-winter.jpg',
    guvenirlikPuani: 96,
    ozellikler: ['Kış Güvenliği', 'Kısa Fren Mesafesi'],
    uygunlukPuani: 0,
    mevsim: 'kis',
    performansSeviyesi: 'premium'
  },
  // 4 Mevsim lastikler
  {
    id: '8',
    marka: 'Michelin',
    model: 'CrossClimate 2',
    ebat: '225/45R17',
    lastikTipi: 'dortMevsim',
    fiyat: 4899,
    gorselUrl: '/images/tires/michelin-crossclimate.jpg',
    guvenirlikPuani: 96,
    ozellikler: ['Tüm Mevsim Performans', 'Çok Yönlü Kullanım'],
    uygunlukPuani: 0,
    mevsim: 'dortMevsim',
    performansSeviyesi: 'premium'
  },
  {
    id: '9',
    marka: 'Goodyear',
    model: 'Vector 4Seasons Gen-3',
    ebat: '225/45R17',
    lastikTipi: 'dortMevsim',
    fiyat: 4599,
    gorselUrl: '/images/tires/goodyear-vector.jpg',
    guvenirlikPuani: 95,
    ozellikler: ['Dengeli Performans', 'Her Mevsim Güvenlik'],
    uygunlukPuani: 0,
    mevsim: 'dortMevsim',
    performansSeviyesi: 'premium'
  }
];

const AiOnerisiSection: React.FC<AiOnerisiSectionProps> = ({ formData, t }) => {
  const [oneriler, setOneriler] = useState<LastikOnerisi[]>([]);

  // Lastik özelliklerini normalize etme fonksiyonu
  const normalizeOzellik = (value: string): string => {
    return value.toLowerCase().trim().replace(/\s+/g, '');
  };

  // Ebat parçalama ve normalizasyon fonksiyonu
  const parseEbat = (ebat: string) => {
    const [genislik, oran, cap] = ebat.split(/[\/R]/);
    return {
      genislik: parseInt(genislik),
      oran: parseInt(oran),
      cap: parseInt(cap)
    };
  };

  // Benzerlik puanı hesaplama fonksiyonu
  const hesaplaBenzerlikPuani = (lastik: LastikOnerisi, formData: FormData): number => {
    let toplamPuan = 0;
    const maxPuan = 100;

    // 1. Lastik Tipi Benzerliği (40 puan)
    const lastikTipiPuan = (() => {
      type LastikTipi = 'yaz' | 'kis' | 'dortMevsim';
      const lastikTipiEslesme: Record<LastikTipi, Record<LastikTipi, number>> = {
        'yaz': {
          'yaz': 1.0,
          'dortMevsim': 0.7,
          'kis': 0.2
        },
        'kis': {
          'kis': 1.0,
          'dortMevsim': 0.7,
          'yaz': 0.2
        },
        'dortMevsim': {
          'dortMevsim': 1.0,
          'yaz': 0.6,
          'kis': 0.6
        }
      };

      const tip1 = normalizeOzellik(lastik.lastikTipi) as LastikTipi;
      const tip2 = normalizeOzellik(formData.lastikTipi) as LastikTipi;
      
      return (lastikTipiEslesme[tip1]?.[tip2] || 0) * 40;
    })();

    // 2. Marka Benzerliği (25 puan)
    const markaPuan = (() => {
      const markaGruplari = {
        'premium': ['michelin', 'continental', 'bridgestone', 'goodyear', 'pirelli'],
        'orta': ['hankook', 'dunlop', 'yokohama', 'toyo'],
        'ekonomik': ['lassa', 'petlas', 'falken', 'kumho']
      };

      const marka1 = normalizeOzellik(lastik.marka);
      const marka2 = normalizeOzellik(formData.marka);

      if (marka1 === marka2) return 25;
      
      for (const [grup, markalar] of Object.entries(markaGruplari)) {
        if (markalar.includes(marka1) && markalar.includes(marka2)) {
          return 20;
        }
      }
      
      return 5;
    })();

    // 3. Ebat Benzerliği (25 puan)
    const ebatPuan = (() => {
      if (!formData.ebat) return 0;

      const ebat1 = parseEbat(lastik.ebat);
      const ebat2 = parseEbat(formData.ebat);

      let puan = 0;

      // Genişlik benzerliği (10 puan)
      const genislikFark = Math.abs(ebat1.genislik - ebat2.genislik);
      if (genislikFark === 0) puan += 10;
      else if (genislikFark <= 10) puan += 7;
      else if (genislikFark <= 20) puan += 4;

      // Oran benzerliği (8 puan)
      const oranFark = Math.abs(ebat1.oran - ebat2.oran);
      if (oranFark === 0) puan += 8;
      else if (oranFark <= 5) puan += 5;
      else if (oranFark <= 10) puan += 3;

      // Çap benzerliği (7 puan)
      if (ebat1.cap === ebat2.cap) puan += 7;
      else if (Math.abs(ebat1.cap - ebat2.cap) === 1) puan += 4;

      return puan;
    })();

    // 4. Model Benzerliği (10 puan)
    const modelPuan = (() => {
      if (!formData.model) return 0;

      const model1 = normalizeOzellik(lastik.model);
      const model2 = normalizeOzellik(formData.model);

      // Model serisi benzerliği
      const modelSerileri = {
        'sport': ['sport', 'potenza', 'pilot', 'eagle', 'supersport'],
        'comfort': ['comfort', 'turanza', 'primacy', 'premium', 'efficient'],
        'allseason': ['allseason', 'crossclimate', 'vector', '4seasons', 'weather'],
        'winter': ['winter', 'alpin', 'blizzak', 'snow', 'ice']
      };

      // Tam eşleşme
      if (model1 === model2) return 10;

      // Kısmi eşleşme
      if (model1.includes(model2) || model2.includes(model1)) return 8;

      // Model serisi eşleşmesi
      for (const [seri, anahtarKelimeler] of Object.entries(modelSerileri)) {
        const model1Seri = anahtarKelimeler.some(k => model1.includes(k));
        const model2Seri = anahtarKelimeler.some(k => model2.includes(k));
        
        if (model1Seri && model2Seri) return 6;
      }

      return 2;
    })();

    // Toplam puanı hesapla
    toplamPuan = lastikTipiPuan + markaPuan + ebatPuan + modelPuan;

    // Güvenilirlik puanını da dikkate al
    const guvenilirlikEtkisi = lastik.guvenirlikPuani / 100;
    toplamPuan = toplamPuan * (0.8 + 0.2 * guvenilirlikEtkisi);

    return Math.round(toplamPuan);
  };

  // Önerileri güncelleme fonksiyonu
  const guncelleOneriler = () => {
    if (!formData.lastikTipi || !formData.marka || !formData.ebat) {
      // Temel kriterler eksikse varsayılan önerileri göster
      setOneriler(tumLastikler.slice(0, 4));
      return;
    }

    // Tüm lastiklere benzerlik puanı hesapla
    const puanliLastikler = tumLastikler.map(lastik => ({
      ...lastik,
      uygunlukPuani: hesaplaBenzerlikPuani(lastik, formData)
    }));

    // Puanlarına göre sırala ve en iyi 4 öneriyi al
    const siraliOneriler = puanliLastikler
      .sort((a, b) => {
        // Önce uygunluk puanına göre sırala
        if (b.uygunlukPuani !== a.uygunlukPuani) {
          return b.uygunlukPuani - a.uygunlukPuani;
        }
        // Uygunluk puanları eşitse güvenilirlik puanına göre sırala
        return b.guvenirlikPuani - a.guvenirlikPuani;
      })
      .slice(0, 4);

    setOneriler(siraliOneriler);
  };

  // Form verisi değiştiğinde önerileri güncelle
  useEffect(() => {
    guncelleOneriler();
  }, [formData]);

  // Fiyat formatı
  const formatFiyat = (fiyat: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(fiyat);
  };

  return (
    <div className="w-full bg-dark-200 p-6 rounded-xl">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Aracınız için özel seçilmiş lastikler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {oneriler.map((lastik) => (
          <motion.div
            key={lastik.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-300 rounded-lg p-4 hover:bg-dark-400 transition-all duration-300"
          >
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={lastik.gorselUrl}
                alt={`${lastik.marka} ${lastik.model}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{lastik.marka}</h3>
                <p className="text-gray-400">{lastik.model}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-500/20 px-2 py-1 rounded">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">%{lastik.guvenirlikPuani}</span>
                </div>
                <div className="flex items-center bg-blue-500/20 px-2 py-1 rounded">
                  <ThumbsUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-500">%{lastik.uygunlukPuani}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-gray-400 text-sm">{lastik.ebat}</p>
              <div className="flex flex-wrap gap-2">
                {lastik.ozellikler.map((ozellik, index) => (
                  <span
                    key={index}
                    className="text-xs bg-dark-500 text-gray-300 px-2 py-1 rounded"
                  >
                    {ozellik}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">
                {formatFiyat(lastik.fiyat)}
              </span>
              <button className="flex items-center bg-primary hover:bg-primary/80 text-white px-3 py-2 rounded transition-all duration-300">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AiOnerisiSection; 