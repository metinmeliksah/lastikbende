import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { AnalysisResult } from '../types';
import { Tooltip } from 'react-tooltip';

type Severity = 'high' | 'medium' | 'low';
type Urgency = 'immediate' | 'soon' | 'monitor' | 'optional';

interface Sorun {
  type: string;
  description: string;
  severity: Severity;
  urgency: Urgency;
  confidence: number;
  recommendations?: string[];
  location?: string;
  visualSigns?: string;
  problemOrigin?: string;
  suggestedAction: string;
  estimatedCost: 'high' | 'medium' | 'low';
  safetyImpact: 'critical' | 'significant' | 'moderate' | 'minor';
  maintenanceType: 'replacement' | 'repair' | 'adjustment' | 'monitoring';
}

interface SorunlarSectionProps {
  sorunlar: Sorun[] | null;
  setFilteredSorunlar: React.Dispatch<React.SetStateAction<AnalysisResult['sorunlar'] | null>>;
  filteredSorunlar: AnalysisResult['sorunlar'] | null;
  t?: any;
}

const SorunlarSection = ({ sorunlar, setFilteredSorunlar, filteredSorunlar, t }: SorunlarSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredResults = useMemo(() => {
    if (!sorunlar || sorunlar.length === 0) return [];

    let results = [...sorunlar];

    switch (selectedFilter) {
      case 'all':
        break;
      case 'severity-high-first':
        results.sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
        break;
      case 'severity-low-first':
        results.sort((a, b) => {
          const severityOrder = { high: 2, medium: 1, low: 0 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
        break;
      case 'urgency':
        results.sort((a, b) => {
          const urgencyOrder = { immediate: 0, soon: 1, monitor: 2, optional: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });
        break;
      case 'confidence-high-first':
        results.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'high-severity':
        results = results.filter(sorun => sorun.severity === 'high');
        break;
      case 'immediate':
        results = results.filter(sorun => sorun.urgency === 'immediate');
        break;
      case 'replacement':
        results = results.filter(sorun => sorun.maintenanceType === 'replacement');
        break;
      default:
        break;
    }

    return results;
  }, [sorunlar, selectedFilter]);

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'medium':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'low':
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityText = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return 'Yüksek Risk';
      case 'medium':
        return 'Orta Risk';
      case 'low':
        return 'Düşük Risk';
      default:
        return '';
    }
  };

  const getUrgencyText = (urgency: Urgency) => {
    switch (urgency) {
      case 'immediate':
        return 'Acil Müdahale Gerekli';
      case 'soon':
        return 'Yakın Zamanda Müdahale Gerekli';
      case 'monitor':
        return 'İzlenmeli';
      case 'optional':
        return 'İsteğe Bağlı Müdahale';
      default:
        return '';
    }
  };

  return (
    <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-medium text-white mb-4 md:mb-0">{t?.issues?.title || 'Tespit Edilen Sorunlar'}</h3>
        
        {sorunlar && (
          <div className="flex flex-wrap gap-2">
            <select 
              className="bg-dark-300 text-gray-300 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-primary w-full md:w-auto text-sm sm:text-base"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              aria-label={t?.issues?.filterLabel || 'Sorunları filtrele'}
            >
              <optgroup label={t?.issues?.sortAndFilter || 'Sırala ve Filtrele'}>
                <option value="all">{t?.issues?.allIssues || 'Tüm Sorunlar'}</option>
              </optgroup>
              <optgroup label={t?.issues?.sorting || 'Sıralama'}>
                <option value="severity-high-first">{t?.issues?.sortBySeverity || 'Risk Seviyesine Göre Sırala'}</option>
                <option value="urgency">{t?.issues?.sortByUrgency || 'Aciliyete Göre Sırala'}</option>
                <option value="confidence-high-first">{t?.issues?.sortByConfidence || 'Güvenilirliğe Göre Sırala'}</option>
              </optgroup>
              <optgroup label={t?.issues?.filtering || 'Filtreleme'}>  
                <option value="high-severity">{t?.issues?.highRiskOnly || 'Sadece Yüksek Risk'}</option>
                <option value="immediate">{t?.issues?.immediateOnly || 'Sadece Acil Olanlar'}</option>
                <option value="replacement">{t?.issues?.replacementOnly || 'Sadece Değişim Gerektirenler'}</option>
              </optgroup>
            </select>
          </div>
        )}
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {filteredResults.map((sorun, index) => (
          <motion.div
            key={index}
            role="listitem"
            aria-label={`${sorun.type} - ${sorun.severity} risk seviyesi`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-dark-300 rounded-lg p-3 sm:p-4 border border-gray-600 hover:border-primary transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {sorun.severity ? (
                  <span className="flex items-center justify-center">
                    {sorun.severity === 'high' && (
                      <FaExclamationTriangle className="text-red-500 w-4 h-4" title="Yüksek Risk" />
                    )}
                    {sorun.severity === 'medium' && (
                      <FaExclamationCircle className="text-yellow-500 w-4 h-4" title="Orta Risk" />
                    )}
                    {sorun.severity === 'low' && (
                      <FaInfoCircle className="text-blue-500 w-4 h-4" title="Düşük Risk" />
                    )}
                  </span>
                ) : null}
                <h4 className="text-sm sm:text-base font-medium text-white">
                  {sorun.type}
                </h4>
              </div>
              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                sorun.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                sorun.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-green-500/20 text-green-500'
              }`}>
                {getSeverityText(sorun.severity)}
              </span>
            </div>
            
            <p className="text-gray-300 text-xs sm:text-sm mb-2 whitespace-normal leading-5 line-clamp-2">{sorun.description}</p>
            
            <details className="mb-2 group">
              <summary className="cursor-pointer text-primary text-xs sm:text-sm font-medium mb-1 hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 -mx-1">
                {t?.issues?.details || 'Detaylı Bilgi'}
              </summary>
              <div className="pl-2 mt-2 space-y-2 border-l-2 border-dark-400">
                {sorun.location && (
                  <div className="p-2 bg-dark-400 rounded-md">
                    <div className="flex items-start mb-1">
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-xs sm:text-sm font-medium">{t?.issues?.location || 'Tespit Edilen Bölge:'}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm ml-6">{sorun.location}</p>
                  </div>
                )}
                
                {sorun.visualSigns && (
                  <div className="p-2 bg-dark-400 rounded-md">
                    <div className="flex items-start mb-1">
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-white text-xs sm:text-sm font-medium">{t?.issues?.visualSigns || 'Görsel Belirtiler:'}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm ml-6">{sorun.visualSigns}</p>
                  </div>
                )}
                
                {sorun.problemOrigin && (
                  <div className="p-2 bg-dark-400 rounded-md">
                    <div className="flex items-start mb-1">
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white text-xs sm:text-sm font-medium">{t?.issues?.problemOrigin || 'Sorunun Kaynağı:'}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm ml-6">{sorun.problemOrigin}</p>
                  </div>
                )}
              </div>
            </details>
            
            {sorun.suggestedAction && (
              <div className="mb-2 p-2 bg-primary/5 rounded-md border border-primary/20">
                <div className="flex items-start mb-1">
                  <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-primary text-xs sm:text-sm font-medium">{t?.issues?.suggestedAction || 'Önerilen İşlem:'}</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm ml-6">{sorun.suggestedAction}</p>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Aciliyet gösterimi */}
              <span 
                className={`px-2 py-0.5 rounded-full text-xs cursor-help font-semibold shadow-sm transition-colors duration-200 ${
                  sorun.urgency === 'immediate' ? 'bg-red-500/10 text-red-400' :
                  sorun.urgency === 'soon' ? 'bg-yellow-500/10 text-yellow-400' :
                  sorun.urgency === 'monitor' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-green-500/10 text-green-400'
                }`}
                title={getUrgencyText(sorun.urgency)}
              >
                {getUrgencyText(sorun.urgency)}
              </span>
              {/* Bakım tipi gösterimi - her zaman göster, modern tooltip ile */}
              <span
                data-tooltip-id={`maintenance-tooltip-${index}`}
                data-tooltip-content={
                  sorun.maintenanceType === 'replacement'
                    ? 'Değişim: Lastiğin yenisiyle değiştirilmesi gerekiyor'
                    : sorun.maintenanceType === 'repair'
                    ? 'Tamir: Uygun bir tamir işlemi ile çözülebilir'
                    : sorun.maintenanceType === 'adjustment'
                    ? 'Ayarlama: Basınç, balans veya rot ayarı gerekiyor'
                    : 'İzleme: Düzenli kontrol edilmesi yeterli'
                }
                className={`px-2 py-0.5 rounded-full text-xs cursor-help font-semibold shadow-sm transition-colors duration-200 ${
                  sorun.maintenanceType === 'replacement' ? 'bg-red-500/10 text-red-400' :
                  sorun.maintenanceType === 'repair' ? 'bg-orange-500/10 text-orange-400' :
                  sorun.maintenanceType === 'adjustment' ? 'bg-yellow-500/10 text-yellow-400' :
                  sorun.maintenanceType === 'monitoring' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}
              >
                {sorun.maintenanceType === 'replacement' ? 'Değişim Gerekli' :
                 sorun.maintenanceType === 'repair' ? 'Tamir Gerekli' :
                 sorun.maintenanceType === 'adjustment' ? 'Ayarlama Gerekli' :
                 'İzleme Gerekli'}
                <Tooltip id={`maintenance-tooltip-${index}`} place="top" className="z-50 !text-xs !font-medium !bg-dark-400 !text-white !rounded !px-3 !py-2 !shadow-lg" />
              </span>
              
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <span>Güvenilirlik:</span>
                <div className="w-12 bg-dark-400 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      (sorun.confidence || 0.5) > 0.8 ? 'bg-green-500' :
                      (sorun.confidence || 0.5) > 0.6 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.round((sorun.confidence || 0.5) * 100)}%` }}
                  />
                </div>
                <span className="min-w-[28px] text-center">{Math.round((sorun.confidence || 0.5) * 100)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SorunlarSection; 