import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';

interface SorunlarSectionProps {
  sorunlar: AnalysisResult['sorunlar'];
  setFilteredSorunlar: React.Dispatch<React.SetStateAction<AnalysisResult['sorunlar'] | null>>;
  filteredSorunlar: AnalysisResult['sorunlar'] | null;
  t?: any;
}

const SorunlarSection: React.FC<SorunlarSectionProps> = ({
  sorunlar,
  setFilteredSorunlar,
  filteredSorunlar,
  t
}) => {
  // Seçilen filtreleme türünü tutan state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filtreleme işlemini gerçekleştiren fonksiyon
  const handleFilterChange = (filterType: string) => {
    if (!sorunlar || !sorunlar.length) {
      setFilteredSorunlar([]);
      setSelectedFilter(filterType);
      return;
    }
    
    try {
      setSelectedFilter(filterType);
      
      if (filterType === 'all') {
        // Tüm sorunları göster - orijinal sıralamada
        setFilteredSorunlar([...sorunlar]);
      } else if (filterType === 'severity-high-first') {
        // Şiddete göre sırala (yüksek-orta-düşük)
        const sortedSorunlar = [...sorunlar].sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          // Varsayılan olarak "medium" kullan eğer değer tanımlı değilse
          const aSeverity = a.severity || 'medium';
          const bSeverity = b.severity || 'medium';
          return severityOrder[aSeverity] - severityOrder[bSeverity];
        });
        setFilteredSorunlar(sortedSorunlar);
      } else if (filterType === 'urgency') {
        // Aciliyete göre sırala
        const sortedSorunlar = [...sorunlar].sort((a, b) => {
          const urgencyOrder = { immediate: 0, soon: 1, monitor: 2, optional: 3 };
          // Varsayılan olarak "monitor" kullan eğer değer tanımlı değilse
          const aUrgency = a.urgency || 'monitor';
          const bUrgency = b.urgency || 'monitor';
          return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
        });
        setFilteredSorunlar(sortedSorunlar);
      } else if (filterType === 'confidence-high-first') {
        // Güven seviyesine göre sırala (yüksekten düşüğe)
        const sortedSorunlar = [...sorunlar].sort((a, b) => {
          // Varsayılan olarak 0.5 kullan eğer değer tanımlı değilse
          const aConfidence = a.confidence || 0.5;
          const bConfidence = b.confidence || 0.5;
          return bConfidence - aConfidence;
        });
        setFilteredSorunlar(sortedSorunlar);
      } else if (filterType === 'high-severity') {
        // Sadece yüksek riskli sorunları filtrele
        const filteredResults = sorunlar.filter(sorun => sorun.severity === 'high');
        setFilteredSorunlar(filteredResults);
      } else if (filterType === 'immediate') {
        // Sadece acil sorunları filtrele
        const filteredResults = sorunlar.filter(sorun => sorun.urgency === 'immediate');
        setFilteredSorunlar(filteredResults);
      } else if (filterType === 'replacement') {
        // Sadece değişim gerektiren sorunları filtrele
        const filteredResults = sorunlar.filter(sorun => sorun.maintenanceType === 'replacement');
        setFilteredSorunlar(filteredResults);
      }
    } catch (error) {
      console.error("Sıralama/filtreleme hatası:", error);
      // Hata durumunda en güvenli seçenek: orijinal listeyi göster
      setFilteredSorunlar(sorunlar);
    }
  };

  return (
    <div className="bg-dark-200 p-8 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h3 className="text-2xl font-medium text-white mb-4 md:mb-0">Tespit Edilen Sorunlar</h3>
        
        {sorunlar && (
          <div className="flex flex-wrap gap-2">
            <select 
              className="bg-dark-300 text-gray-300 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-primary w-full"
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <optgroup label="Sırala ve Filtrele">
                <option value="all">Tüm Sorunlar</option>
              </optgroup>
              <optgroup label="Sıralama">
                <option value="severity-high-first">Risk Seviyesine Göre Sırala</option>
                <option value="urgency">Aciliyete Göre Sırala</option>
                <option value="confidence-high-first">Güvenilirliğe Göre Sırala</option>
              </optgroup>
              <optgroup label="Filtreleme">  
                <option value="high-severity">Sadece Yüksek Risk</option>
                <option value="immediate">Sadece Acil Olanlar</option>
                <option value="replacement">Sadece Değişim Gerektirenler</option>
              </optgroup>
            </select>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {filteredSorunlar && filteredSorunlar.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredSorunlar.map((sorun, index) => (
              <div key={index} className="bg-dark-300 rounded-lg p-4 border border-gray-600 hover:border-primary transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      sorun.severity === 'high' ? 'bg-red-500' :
                      sorun.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <h4 className="text-base font-medium text-white">
                      {sorun.type}
                    </h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sorun.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                    sorun.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {sorun.severity === 'high' ? 'Yüksek Risk' :
                     sorun.severity === 'medium' ? 'Orta Risk' :
                     'Düşük Risk'}
                  </span>
                </div>
                
                {/* Açıklama - Kısa ve tek paragraf olarak göster */}
                <p className="text-gray-300 text-sm mb-2 whitespace-normal leading-5 line-clamp-2">{sorun.description}</p>
                
                {/* Detaylı bilgileri gizli bölüme taşıyoruz */}
                <details className="mb-2">
                  <summary className="cursor-pointer text-primary text-sm font-medium mb-1 hover:text-primary-400">
                    Detaylı Bilgi
                  </summary>
                  <div className="pl-2 mt-2 space-y-2 border-l-2 border-dark-400">
                    {sorun.location && (
                      <div className="p-2 bg-dark-400 rounded-md">
                        <div className="flex items-start mb-1">
                          <svg className="w-4 h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-white text-sm font-medium">Tespit Edilen Bölge:</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-6">{sorun.location}</p>
                      </div>
                    )}
                    
                    {sorun.visualSigns && (
                      <div className="p-2 bg-dark-400 rounded-md">
                        <div className="flex items-start mb-1">
                          <svg className="w-4 h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-white text-sm font-medium">Görsel Belirtiler:</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-6">{sorun.visualSigns}</p>
                      </div>
                    )}
                    
                    {sorun.problemOrigin && (
                      <div className="p-2 bg-dark-400 rounded-md">
                        <div className="flex items-start mb-1">
                          <svg className="w-4 h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-white text-sm font-medium">Sorunun Kaynağı:</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-6">{sorun.problemOrigin}</p>
                      </div>
                    )}
                  </div>
                </details>
                
                {sorun.suggestedAction && (
                  <div className="mb-2 p-2 bg-primary/5 rounded-md border border-primary/20">
                    <div className="flex items-start mb-1">
                      <svg className="w-4 h-4 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-primary text-sm font-medium">Önerilen İşlem:</span>
                    </div>
                    <p className="text-gray-300 text-sm ml-6">{sorun.suggestedAction}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Aciliyet gösterimi */}
                  <span 
                    className={`px-2 py-0.5 rounded-full text-xs cursor-help ${
                      sorun.urgency === 'immediate' ? 'bg-red-500/10 text-red-400' :
                      sorun.urgency === 'soon' ? 'bg-yellow-500/10 text-yellow-400' :
                      sorun.urgency === 'monitor' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-green-500/10 text-green-400'
                    }`}
                    title={
                      sorun.urgency === 'immediate' 
                        ? 'Acil: Hemen müdahale edilmezse güvenlik riski oluşturabilir'
                        : sorun.urgency === 'soon' 
                        ? 'Yakında: 1-2 ay içinde bakım gerektiren sorun'
                        : sorun.urgency === 'monitor' 
                        ? 'İzleme: Düzenli kontrol gerektiren durum'
                        : 'İsteğe Bağlı: Zorunlu olmayan bakım'
                    }
                  >
                    {sorun.urgency === 'immediate' ? 'Acil' :
                     sorun.urgency === 'soon' ? 'Yakında' :
                     sorun.urgency === 'monitor' ? 'İzleme Gerekli' :
                     'İsteğe Bağlı'}
                  </span>
                  
                  {/* Bakım tipi gösterimi - monitoring/monitor dışındakiler için */}
                  {!(sorun.maintenanceType === 'monitoring') && (
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs cursor-help ${
                        sorun.maintenanceType === 'replacement' ? 'bg-red-500/10 text-red-400' :
                        sorun.maintenanceType === 'repair' ? 'bg-orange-500/10 text-orange-400' :
                        sorun.maintenanceType === 'adjustment' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}
                      title={
                        sorun.maintenanceType === 'replacement' 
                          ? 'Değişim: Lastiğin yenisiyle değiştirilmesi gerekiyor'
                          : sorun.maintenanceType === 'repair' 
                          ? 'Tamir: Uygun bir tamir işlemi ile çözülebilir'
                          : sorun.maintenanceType === 'adjustment' 
                          ? 'Ayarlama: Basınç, balans veya rot ayarı gerekiyor'
                          : 'İzleme: Düzenli kontrol edilmesi yeterli'
                      }
                    >
                      {sorun.maintenanceType === 'replacement' ? 'Değişim Gerekli' :
                       sorun.maintenanceType === 'repair' ? 'Tamir Gerekli' :
                       sorun.maintenanceType === 'adjustment' ? 'Ayarlama Gerekli' :
                       'İzleme Gerekli'}
                    </span>
                  )}
                  
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
              </div>
            ))}
          </div>
        ) : sorunlar && sorunlar.length === 0 ? (
          <p className="text-green-500 text-center bg-green-500/10 p-4 rounded-lg border border-green-500/30">
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Herhangi bir sorun tespit edilmedi. Lastik iyi durumda görünüyor.</span>
            </span>
          </p>
        ) : filteredSorunlar && filteredSorunlar.length === 0 ? (
          <p className="text-yellow-500 text-center bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>
                {selectedFilter === 'high-severity' && 'Yüksek riskli sorun bulunamadı.'}
                {selectedFilter === 'immediate' && 'Acil işlem gerektiren sorun bulunamadı.'}
                {selectedFilter === 'replacement' && 'Değişim gerektiren sorun bulunamadı.'}
                {!['high-severity', 'immediate', 'replacement'].includes(selectedFilter) && 'Seçilen filtreleme kriterine göre sorun bulunamadı. Filtreyi değiştirin.'}
              </span>
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center p-4">
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sorunlar analiz ediliyor...</span>
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SorunlarSection; 