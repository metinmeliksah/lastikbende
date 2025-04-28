'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaDownload } from 'react-icons/fa';
import AnalysisResultsSection from '../../analiz/components/AnalysisResultsSection';
import AiAnalysisSection from '../../analiz/components/AiAnalysisSection';

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
  oneriler?: string[];
  ozet?: string;
}

export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [params.id]);

  async function fetchAnalysis() {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAnalysis(data as unknown as Analysis);
    } catch (error) {
      console.error('Analiz yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  // AnalysisResultsSection için uygun veri dönüşümü
  const analysisResults = useMemo(() => analysis && ({
    yasPuani: analysis.yas_puani,
    kullanimPuani: analysis.kullanim_puani,
    mevsimselPuan: analysis.mevsimsel_puan,
    markaPuani: analysis.marka_puani,
    gorselDurum: analysis.gorsel_durum,
    safetyScore: analysis.safety_score,
    sorunlar: analysis.sorunlar,
    oneriler: analysis.oneriler || [],
    ozet: analysis.ozet || '',
    maintenanceNeeds: analysis.bakim_ihtiyaclari || { immediate: [], soon: [], future: [] },
    estimatedLifespan: analysis.tahmini_omur_km && analysis.tahmini_omur_ay ? { months: analysis.tahmini_omur_ay, confidence: 1 } : { months: 0, confidence: 0 },
  }), [analysis]);
  const formData = useMemo(() => analysis && ({
    lastikTipi: analysis.lastik_tipi,
    marka: analysis.marka,
    model: analysis.model,
    ebat: analysis.ebat,
    uretimYili: String(analysis.uretim_yili),
    kilometre: String(analysis.kilometre)
  }), [analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-dark-300 rounded w-48"></div>
            <div className="h-96 bg-dark-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-dark-400 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Analiz bulunamadı</h1>
            <p className="text-gray-400">İstediğiniz analiz bulunamadı veya erişim izniniz yok.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-300 rounded-xl p-8 border border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="relative h-96 rounded-lg overflow-hidden mb-6">
                <Image
                  src={analysis.image_url}
                  alt={`${analysis.marka} ${analysis.model}`}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  {analysis.marka} {analysis.model}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Lastik Tipi</p>
                    <p className="text-white">{analysis.lastik_tipi}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ebat</p>
                    <p className="text-white">{analysis.ebat}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Üretim Yılı</p>
                    <p className="text-white">{analysis.uretim_yili}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kilometre</p>
                    <p className="text-white">{analysis.kilometre}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-dark-400 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Analiz Sonuçları</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Yaş Puanı</p>
                    <p className="text-white">{analysis.yas_puani}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kullanım Puanı</p>
                    <p className="text-white">{analysis.kullanim_puani}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mevsimsel Puan</p>
                    <p className="text-white">{analysis.mevsimsel_puan}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Marka Puanı</p>
                    <p className="text-white">{analysis.marka_puani}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Görsel Durum</p>
                    <p className="text-white">{analysis.gorsel_durum}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Güvenlik Skoru</p>
                    <p className="text-white">{analysis.safety_score}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-400 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Tahmini Ömür</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Kilometre</p>
                    <p className="text-white">{analysis.tahmini_omur_km} km</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ay</p>
                    <p className="text-white">{analysis.tahmini_omur_ay} ay</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 mt-2">
                <button
                  onClick={() => {/* PDF export işlemi */}}
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <FaDownload />
                  <span>PDF Olarak İndir</span>
                </button>
                <button
                  onClick={() => setShowAnalysisResults((v) => !v)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>{showAnalysisResults ? 'Analiz Sonuçlarını Gizle' : 'Analiz Sonuçlarını Burada Göster'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {showAnalysisResults && analysisResults && formData && (
        <div className="mt-8 max-w-7xl mx-auto px-4">
          <AnalysisResultsSection
            results={analysisResults}
            filteredSorunlar={analysisResults.sorunlar}
            setFilteredSorunlar={() => {}}
            formData={formData}
            t={{}}
          />
          <div className="mb-12">
            <AiAnalysisSection
              detayliAnaliz={
                analysis && analysis.ai_analiz
                  ? (typeof analysis.ai_analiz === 'string'
                      ? analysis.ai_analiz
                      : JSON.stringify(analysis.ai_analiz))
                  : undefined
              }
              t={{}}
            />
          </div>
        </div>
      )}
    </main>
  );
} 