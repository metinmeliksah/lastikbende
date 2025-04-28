import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FormData } from '../types';
import Image from 'next/image';
import { ShieldCheck, ShoppingCart, ThumbsUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Analysis {
  id: string;
  created_at: string;
  lastik_tipi: string;
  marka: string;
  model: string;
  ebat: string;
  uretim_yili: number;
  kilometre: number;
  yas_puani: number;
  kullanim_puani: number;
  mevsimsel_puan: number;
  marka_puani: number;
  gorsel_durum: number;
  safety_score: number;
  tahmini_omur_km: number;
  tahmini_omur_ay: number;
  sorunlar: any[];
  bakim_ihtiyaclari: any;
  ai_analiz: any;
  image_url: string;
  uygunlukPuani?: number;
}

interface AiOnerisiSectionProps {
  formData: FormData;
  t?: any;
}

const AiOnerisiSection: React.FC<AiOnerisiSectionProps> = ({ formData, t }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);

  // Veri çekme fonksiyonu
  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Oturum açmanız gerekiyor');
      }

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data as unknown) as Analysis[] || []);
    } catch (error) {
      console.error('Analizler yüklenirken hata:', error);
      setError('Analizler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk yüklemede verileri çek
  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Benzerlik puanı hesaplama fonksiyonu
  const hesaplaBenzerlikPuani = useCallback((analysis: Analysis, formData: FormData): number => {
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

      const tip1 = analysis.lastik_tipi.toLowerCase() as LastikTipi;
      const tip2 = formData.lastikTipi.toLowerCase() as LastikTipi;
      
      return (lastikTipiEslesme[tip1]?.[tip2] || 0) * 40;
    })();

    // 2. Marka Benzerliği (25 puan)
    const markaPuan = (() => {
      const markaGruplari = {
        'premium': ['michelin', 'continental', 'bridgestone', 'goodyear', 'pirelli'],
        'orta': ['hankook', 'dunlop', 'yokohama', 'toyo'],
        'ekonomik': ['lassa', 'petlas', 'falken', 'kumho']
      };

      const marka1 = analysis.marka.toLowerCase();
      const marka2 = formData.marka.toLowerCase();

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

      const parseEbat = (ebat: string) => {
        const [genislik, oran, cap] = ebat.split(/[\/R]/);
        return {
          genislik: parseInt(genislik),
          oran: parseInt(oran),
          cap: parseInt(cap)
        };
      };

      const ebat1 = parseEbat(analysis.ebat);
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

      const model1 = analysis.model.toLowerCase();
      const model2 = formData.model.toLowerCase();

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
    const guvenilirlikEtkisi = analysis.safety_score / 100;
    toplamPuan = toplamPuan * (0.8 + 0.2 * guvenilirlikEtkisi);

    return Math.round(toplamPuan);
  }, []);

  // Önerileri güncelleme fonksiyonu
  const guncelleOneriler = useCallback(() => {
    if (!formData.lastikTipi || !formData.marka || !formData.ebat) {
      setFilteredAnalyses([]);
      return;
    }

    // Tüm analizlere benzerlik puanı hesapla
    const puanliAnalizler = analyses.map(analysis => ({
      ...analysis,
      uygunlukPuani: hesaplaBenzerlikPuani(analysis, formData)
    }));

    // Puanlarına göre sırala ve en iyi 4 öneriyi al
    const siraliOneriler = puanliAnalizler
      .sort((a, b) => {
        // Önce uygunluk puanına göre sırala
        if (b.uygunlukPuani !== a.uygunlukPuani) {
          return b.uygunlukPuani - a.uygunlukPuani;
        }
        // Uygunluk puanları eşitse güvenlik skoruna göre sırala
        return b.safety_score - a.safety_score;
      })
      .slice(0, 4);

    setFilteredAnalyses(siraliOneriler);
  }, [formData, analyses, hesaplaBenzerlikPuani]);

  // Form verisi değiştiğinde önerileri güncelle
  useEffect(() => {
    guncelleOneriler();
  }, [guncelleOneriler]);

  // Fiyat hesaplama fonksiyonu
  const hesaplaFiyat = useCallback((analysis: Analysis): number => {
    // Temel fiyat faktörleri
    const ebatFaktoru = analysis.ebat.includes('R17') ? 1.2 : 
                        analysis.ebat.includes('R18') ? 1.4 : 
                        analysis.ebat.includes('R19') ? 1.6 : 1.0;
    
    const markaFaktoru = analysis.marka_puani / 100;
    
    const performansFaktoru = analysis.safety_score / 100;
    
    // Temel fiyat (TL)
    const temelFiyat = 2500;
    
    // Hesaplanan fiyat
    return Math.round(temelFiyat * ebatFaktoru * (1 + markaFaktoru) * (1 + performansFaktoru));
  }, []);

  // Fiyat formatı
  const formatFiyat = useCallback((fiyat: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(fiyat);
  }, []);

  // Yükleme durumu
  if (loading) {
    return (
      <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-300 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-dark-300 rounded-lg p-4 h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg mt-8">
        <div className="flex items-center justify-center p-8 text-center">
          <div className="bg-red-500/20 p-4 rounded-lg">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={fetchAnalyses}
              className="mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Veri yoksa
  if (analyses.length === 0) {
    return (
      <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg mt-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">AI Lastik Önerisi</h2>
          <p className="text-gray-400 mb-4">Henüz hiç lastik analizi yapmadınız.</p>
          <p className="text-gray-400">Lastik analizi yaparak size özel öneriler alabilirsiniz.</p>
        </div>
      </div>
    );
  }

  // Öneri yoksa
  if (filteredAnalyses.length === 0) {
    return (
      <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg mt-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">AI Lastik Önerisi</h2>
          <p className="text-gray-400 mb-4">Seçtiğiniz kriterlere uygun lastik bulunamadı.</p>
          <p className="text-gray-400">Lütfen farklı kriterler seçerek tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-white mb-6">
        AI Lastik Önerisi
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAnalyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-300 rounded-lg p-4 hover:bg-dark-400 transition-all duration-300"
          >
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={analysis.image_url || '/images/tire-placeholder.jpg'}
                alt={`${analysis.marka} ${analysis.model}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{analysis.marka}</h3>
                <p className="text-gray-400">{analysis.model}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-500/20 px-2 py-1 rounded">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">%{analysis.safety_score}</span>
                </div>
                <div className="flex items-center bg-blue-500/20 px-2 py-1 rounded">
                  <ThumbsUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-500">%{analysis.uygunlukPuani}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.ai_analiz?.oneriler?.slice(0, 3).map((oneri: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                >
                  {oneri}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">
                {formatFiyat(hesaplaFiyat(analysis))}
              </span>
              <button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Satın Al</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AiOnerisiSection; 