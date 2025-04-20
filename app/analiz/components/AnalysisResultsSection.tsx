import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';
import SorunlarSection from './SorunlarSection';
import GuvenlikDegerlendirmesiSection from './GuvenlikDegerlendirmesiSection';
import BakimIhtiyaclariSection from './BakimIhtiyaclariSection';
import TahminiOmurSection from './TahminiOmurSection';

interface AnalysisResultsSectionProps {
  results: AnalysisResult;
  filteredSorunlar: AnalysisResult['sorunlar'] | null;
  setFilteredSorunlar: React.Dispatch<React.SetStateAction<AnalysisResult['sorunlar'] | null>>;
  t: any;
}

const AnalysisResultsSection: React.FC<AnalysisResultsSectionProps> = ({
  results,
  filteredSorunlar,
  setFilteredSorunlar,
  t
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 sm:mt-12 space-y-6 sm:space-y-8"
      role="region"
      aria-label={t?.results?.title || 'Analiz Sonuçları'}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">{t?.results?.title || 'Analiz Sonuçları'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 sm:mb-8">{t?.results?.scoreDistribution || 'Puan Dağılımı'}</h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm sm:text-base text-gray-300">{t?.results?.age || 'Yaş Puanı'}</p>
                <p className="text-sm sm:text-base text-primary">{results.yasPuani}%</p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2 sm:h-3">
                <div className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: `${results.yasPuani}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm sm:text-base text-gray-300">{t?.results?.usage || 'Kullanım Puanı'}</p>
                <p className="text-sm sm:text-base text-primary">{results.kullanimPuani}%</p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2 sm:h-3">
                <div className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: `${results.kullanimPuani}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm sm:text-base text-gray-300">{t?.results?.seasonal || 'Mevsimsel Puan'}</p>
                <p className="text-sm sm:text-base text-primary">{results.mevsimselPuan}%</p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2 sm:h-3">
                <div className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: `${results.mevsimselPuan}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm sm:text-base text-gray-300">{t?.results?.brand || 'Marka Puanı'}</p>
                <p className="text-sm sm:text-base text-primary">{results.markaPuani}%</p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2 sm:h-3">
                <div className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: `${results.markaPuani}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm sm:text-base text-gray-300">{t?.results?.visual || 'Görsel Durum'}</p>
                <p className="text-sm sm:text-base text-primary">{results.gorselDurum}%</p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2 sm:h-3">
                <div className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: `${results.gorselDurum}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <GuvenlikDegerlendirmesiSection safetyScore={results.safetyScore} t={t} />
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-6 sm:gap-8">
        <SorunlarSection 
          sorunlar={results.sorunlar} 
          filteredSorunlar={filteredSorunlar}
          setFilteredSorunlar={setFilteredSorunlar}
          t={t}
        />
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <BakimIhtiyaclariSection maintenanceNeeds={results.maintenanceNeeds} t={t} />
        <TahminiOmurSection estimatedLifespan={results.estimatedLifespan} t={t} />
      </div>
    </motion.div>
  );
};

export default AnalysisResultsSection; 