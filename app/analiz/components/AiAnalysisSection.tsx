import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AiAnalysisSectionProps {
  detayliAnaliz?: string | undefined;
  isLoading?: boolean;
  t?: any;
}

const AiAnalysisSection: React.FC<AiAnalysisSectionProps> = ({
  detayliAnaliz,
  isLoading = false,
  t
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-dark-200 p-8 rounded-xl border border-gray-700/50 shadow-lg mt-8 backdrop-blur-sm"
      >
        <div className="animate-pulse space-y-6">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-primary/20 rounded-full mr-3"></div>
            <div className="h-8 bg-gray-700/50 rounded w-64"></div>
          </div>
          <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
          <div className="space-y-4 bg-dark-300/80 p-6 rounded-lg border border-gray-600/50">
            <div className="h-24 bg-gray-700/50 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!detayliAnaliz) return null;
  
  let parsedAnalysis;
  try {
    parsedAnalysis = JSON.parse(detayliAnaliz);
  } catch (error) {
    console.error('JSON parse hatası:', error);
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center backdrop-blur-sm"
      >
        <svg className="w-8 h-8 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-red-300 mb-3 font-medium">Analiz verisi düzgün biçimde gösterilemiyor</p>
        <details className="text-left">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors duration-200 mb-2">
            Hata detaylarını göster
          </summary>
          <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono overflow-auto max-h-96 bg-dark-400/50 p-4 rounded-lg">
            {detayliAnaliz}
          </pre>
        </details>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-dark-200 p-8 rounded-xl border border-gray-700/50 shadow-lg mt-8 backdrop-blur-sm"
    >
      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg className="w-7 h-7 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        {t?.results?.aiAnalysis || 'Yapay Zeka Detaylı Analizi'}
      </h3>
      <div className="mt-2">
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Bu analiz, uzman lastik sistemimiz tarafından lastik verileri ve görüntü analizi kullanılarak oluşturulmuştur.
        </p>
        
        <div className="bg-dark-300/80 p-6 rounded-lg border border-gray-600/50 backdrop-blur-sm">
          <div className="space-y-8">
            {/* Özet Bölümü */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-gradient-to-br from-dark-400/90 to-dark-500/90 p-6 rounded-lg border border-gray-700/50 shadow-inner backdrop-blur-sm"
            >
              <h4 className="text-white text-xl mb-5 font-semibold flex items-center">
                <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Teknik Değerlendirme Özeti
              </h4>
              <p className="text-gray-200 leading-relaxed text-[15px]">
                {parsedAnalysis.summary || "Teknik değerlendirme özeti bulunamadı."}
              </p>
            </motion.div>

            {/* Özel Değerlendirmeler - Sadece veri varsa göster */}
            <AnimatePresence>
              {parsedAnalysis.specialConsiderations && parsedAnalysis.specialConsiderations.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-dark-400/80 rounded-lg overflow-hidden border border-gray-700/50 backdrop-blur-sm"
                >
                  <div 
                    className="p-5 bg-dark-500/50 cursor-pointer flex justify-between items-center hover:bg-dark-500/70 transition-colors duration-200"
                    onClick={() => setExpandedSection(expandedSection === 'special' ? null : 'special')}
                  >
                    <h4 className="text-white text-lg font-semibold flex items-center">
                      <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Özel Değerlendirmeler
                    </h4>
                    <motion.svg 
                      className="w-5 h-5 text-primary"
                      animate={{ rotate: expandedSection === 'special' ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </motion.svg>
                  </div>
                  <motion.div 
                    initial={false}
                    animate={{ 
                      height: expandedSection === 'special' ? 'auto' : 0,
                      opacity: expandedSection === 'special' ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-dark-300/50">
                      <p className="text-gray-200 leading-relaxed text-[15px]">
                        {parsedAnalysis.specialConsiderations}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AiAnalysisSection; 