'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzeTireImage } from './services/azure-vision';
import { getTranslation } from './translations';
import { API_ENDPOINTS, API_CONFIG } from './config/api';
import { validateField } from './services/validationService';
import { sendChatMessage } from './services/chatService';
import './styles.css';
import { cacheAdapter } from './lib/cacheAdapter';

import { FormData, FieldStatus, AnalysisResult } from './types';
import FormSection from './components/FormSection';
import ImageUploadSection from './components/ImageUploadSection';
import AnalysisResultsSection from './components/AnalysisResultsSection';
import ExportAnalysisSection from './components/ExportAnalysisSection';
import AiAnalysisSection from './components/AiAnalysisSection';
import TireExpertChat from './components/TireExpertChat';
import AiOnerisiSection from './components/AiOnerisiSection';

export default function AnalizPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    lastikTipi: '',
    marka: '',
    model: '',
    ebat: '',
    uretimYili: '',
    kilometre: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasTire, setHasTire] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [filteredSorunlar, setFilteredSorunlar] = useState<AnalysisResult['sorunlar'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fieldStatus, setFieldStatus] = useState<FieldStatus>({
    lastikTipi: { success: false, message: '' },
    marka: { success: false, message: '' },
    model: { success: false, message: '' },
    ebat: { success: false, message: '' },
    uretimYili: { success: false, message: '' },
    kilometre: { success: false, message: '' }
  });
  const [errors, setErrors] = useState<{
    lastikTipi: string;
    marka: string;
    model: string;
    ebat: string;
    uretimYili: string;
    kilometre: string;
  }>({
    lastikTipi: '',
    marka: '',
    model: '',
    ebat: '',
    uretimYili: '',
    kilometre: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const t = getTranslation();

  // Sayfa yenilendiğinde tüm verileri temizle
  useEffect(() => {
    // Önbelleği temizle
    const clearCache = async () => {
      await cacheAdapter.clearAll();
    };
    clearCache();
    
    // Form verilerini sıfırla
    setFormData({
      lastikTipi: '',
      marka: '',
      model: '',
      ebat: '',
      uretimYili: '',
      kilometre: ''
    });
    
    // Görsel verileri temizle
    setImageUrl('');
    setPreview(null);
    setHasTire(false);
    
    // Analiz sonuçlarını temizle
    setResults(null);
    setFilteredSorunlar(null);
    
    // Hata mesajlarını temizle
    setError(null);
    
    // Form alan durumlarını sıfırla
    setFieldStatus({
      lastikTipi: { success: false, message: '' },
      marka: { success: false, message: '' },
      model: { success: false, message: '' },
      ebat: { success: false, message: '' },
      uretimYili: { success: false, message: '' },
      kilometre: { success: false, message: '' }
    });
    
    // Sayfa kapatılırken de önbelleği temizle
    window.addEventListener('beforeunload', async () => {
      await cacheAdapter.clearAll();
    });
    
    // Cleanup fonksiyonu: event listener'ı kaldır
    return () => {
      window.removeEventListener('beforeunload', async () => {
        await cacheAdapter.clearAll();
      });
    };
  }, []);

  // useCallback ile debounce fonksiyonu
  const debounceValidation = useCallback((name: string, value: string) => {
    // Boş değer için doğrulama yapmaya gerek yok
    if (!value.trim()) return;
    
    const timeoutId = setTimeout(async () => {
        setValidating(true);
        try {
          // Form validasyonu için istek gönder
          const response = await fetch('/analiz/api/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              field: name,
              value: value,
              context: {
                lastikTipi: formData.lastikTipi,
                marka: formData.marka,
                model: formData.model
              }
            }),
          });

          // API yanıtını kontrol et
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || t.errors.validationError);
          }

          const data = await response.json();
          
          if (data.success && data.message) {
            // Process validation response
            const correctedValue = data.message.match(/Corrected value: "([^"]+)"/)?.[1];
            
            if (correctedValue && correctedValue !== value) {
              // Apply corrected value to form field
              setFormData(prev => ({
                ...prev,
                [name]: correctedValue
              }));

              // Inform user in Turkish
              setError(t.errors.correctionSuggestion
                .replace('{original}', value)
                .replace('{corrected}', correctedValue));
            }
          }
        } catch (error: any) {
          console.error('Validation error:', error);
          
          // Hata türüne göre özel mesajlar
          if (error.message.includes('network') || error.message.includes('failed to fetch')) {
            setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
          } else if (error.message.includes('timeout')) {
            setError('Sunucu yanıt vermedi. Lütfen daha sonra tekrar deneyin.');
          } else {
            setError(error.message || t.errors.validationError);
          }
          
          // Form alanının durumunu hataya göre ayarla
          setFieldStatus(prev => ({
            ...prev,
            [name]: {
              success: false,
              message: error.message || t.errors.validationError
            }
          }));
        } finally {
          setValidating(false);
        }
      }, 1200); // 600ms yerine 1200ms bekle - kullanıcı deneyimini iyileştirmek için daha uzun bekleme süresi

    return timeoutId;
  }, [formData, t.errors]);

  // Tek bir form değişiklik işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Form alanlarını güncelle
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Form alanları değiştiğinde hata mesajını temizle
    if (error) {
      setError(null);
    }

    // Form alanının durumunu sıfırla
    setFieldStatus(prev => ({
      ...prev,
      [name]: { success: false, message: '' }
    }));

    // Marka veya model alanı değiştiğinde doğrulama yap
    if ((name === 'marka' || name === 'model') && value.trim().length > 2) {
      debounceValidation(name, value);
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!value.trim()) return;

    // Üretim yılı için özel doğrulama ekle
    if (name === 'uretimYili') {
      const currentYear = new Date().getFullYear();
      const year = parseInt(value);
      
      if (isNaN(year) || year < 1900 || year > currentYear) {
        setFieldStatus(prev => ({ 
          ...prev, 
          [name]: { 
            success: false, 
            message: `Üretim yılı 1900 ile ${currentYear} arasında olmalıdır.` 
          } 
        }));
        return;
      }
    }

    // Tüm alanları başarılı olarak işaretle
    setFieldStatus(prev => ({ 
      ...prev, 
      [name]: { 
        success: true, 
        message: '' 
      } 
    }));
  };

  // Enter veya Tab tuşuna basıldığında
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  // Input alanlarının className'ini güncelle
  const getInputClassName = (name: string) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg bg-dark-300 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50";
    
    if (!fieldStatus[name as keyof typeof fieldStatus]) {
      return `${baseClasses} border-gray-600`;
    }
    
    switch (fieldStatus[name as keyof typeof fieldStatus].success) {
      case true:
        return `${baseClasses} border-green-500/50 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)]`;
      case false:
        return `${baseClasses} border-red-500/50 bg-red-500/5`;
      default:
        return `${baseClasses} border-gray-600`;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(t.errors.invalidFileType);
      }

      // Validate file size
      if (file.size > API_CONFIG.maxFileSize) {
        throw new Error(t.errors.fileTooLarge);
      }

      setAnalyzing(true);
      setHasTire(false);
      setError(null);
      setResults(null); // Mevcut sonuçları temizle

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          setPreview(base64Image);
          setImageUrl(base64Image);
          
          // Lastik tespiti için API'ye istek gönder
          try {
            console.log('Lastik tespit ediliyor...');
            setAnalyzing(true);
            
            // API'ye istek gönder
            const apiUrl = `/analiz/api/analyze`;
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: base64Image,
                detectOnly: true // Sadece tespit yap
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || t.errors.analysisError);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (data.success) {
              setHasTire(true);
              console.log('Lastik tespit edildi');
            } else {
              // Lastik tespit algoritması başarısız olduğunda fotoğrafı kaldır
              setHasTire(false);
              setPreview(null);
              setImageUrl('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              throw new Error(data.error || t.errors.noTireDetected);
            }
          } catch (detectionError: any) {
            console.error('Lastik tespit hatası:', detectionError);
            // Lastik tespit algoritması başarısız olduğunda fotoğrafı kaldır
            setHasTire(false);
            setPreview(null);
            setImageUrl('');
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            throw new Error(detectionError.message || t.errors.analysisError);
          } finally {
            setAnalyzing(false);
          }
        } catch (error: any) {
          console.error('Görüntü işleme hatası:', error);
          // Genel görüntü işleme hatası durumunda fotoğrafı kaldır
          setHasTire(false);
          setPreview(null);
          setImageUrl('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setError(error.message || t.errors.processingError);
        }
      };

      reader.onerror = () => {
        setError(t.errors.fileReadError);
        setHasTire(false);
        setAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      setError(error.message || t.errors.uploadError);
      setHasTire(false);
      setAnalyzing(false);
    }
  };

  const handleRemoveImage = useCallback(() => {
    setImageUrl('');
    setPreview(null);
    setError('');
    setHasTire(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Tüm bellek verilerini temizleyecek fonksiyon
  const clearMemoryData = useCallback(async () => {
    // Önbelleği temizle
    await cacheAdapter.clearAll();
    console.log('Cache cleared before new analysis');
    
    // Analiz sonuçlarını temizle
    setResults(null);
    setFilteredSorunlar(null);
    
    // Hata mesajlarını temizle
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Yeni analiz öncesi mevcut verileri temizle
    await clearMemoryData();
    
    setLoading(true);
    setAnalyzing(true);

    try {
      // Form validasyonu
      const missingFields = [];
      if (!formData.lastikTipi) missingFields.push('Lastik Tipi');
      if (!formData.marka) missingFields.push('Lastik Markası');
      if (!formData.uretimYili) missingFields.push('Üretim Yılı');

      if (missingFields.length > 0) {
        throw new Error(t.errors.missingFields.replace('{fields}', missingFields.join(', ')));
      }

      if (!imageUrl) {
        throw new Error(t.errors.noImage);
      }

      if (!hasTire) {
        throw new Error(t.errors.noTireDetected);
      }

      // Üretim yılı doğrulaması
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.uretimYili);
      if (isNaN(year) || year < 1900 || year > currentYear + 1) { // +1 eklendi, gelecek yıl lastikleri için
        throw new Error(t.errors.invalidYear.replace('{maxYear}', (currentYear + 1).toString()));
      }

      // Analiz API'sine istek gönder
      try {
        console.log('Lastik analiz ediliyor...');
        const apiUrl = `/analiz/api/analyze`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl,
            formData,
            detectOnly: false // Tam analiz yap
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t.errors.analysisError);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || t.errors.analysisError);
        }

        if (!data.data) {
          throw new Error(t.errors.analysisError);
        }

        // Analiz sonuçlarını ayarla
        setResults(data.data);
        setError(null);
        
        // Analize başarılı bir şekilde tamamlandı mesajı göster
        // Bu kısım isteğe bağlıdır ve sitenizin tasarımına göre değişebilir.
        // toast.success('Lastik analizi başarıyla tamamlandı!');
        
        // Sayfayı sonuç bölümüne kaydır (isteğe bağlı)
        // window.scrollTo({ top: resultsRef.current?.offsetTop || 0, behavior: 'smooth' });
        
      } catch (analysisError: any) {
        console.error('Lastik analiz hatası:', analysisError);
        throw new Error(analysisError.message || t.errors.analysisError);
      }
    } catch (error: any) {
      console.error('Form gönderim hatası:', error);
      setError(error.message || t.errors.genericError);
      setResults(null); // Hatada sonuçları temizle
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  // Analiz butonunun disabled durumunu kontrol eden fonksiyon
  const isAnalyzeButtonDisabled = () => {
    // Zorunlu form alanları kontrolü
    const hasRequiredFields = formData.lastikTipi && formData.marka && formData.uretimYili;
    
    // Lastik tespiti kontrolü
    const hasTireDetected = hasTire;
    
    // Yükleme durumu kontrolü
    const isProcessing = loading || analyzing;
    
    // Tüm koşullar sağlanıyorsa buton aktif olacak
    return !hasRequiredFields || !hasTireDetected || isProcessing;
  };

  // Her results değiştiğinde filteredSorunlar'ı sıfırla
  useEffect(() => {
    if (results && results.sorunlar) {
      // Sorunlar varsa filtrelenmemiş diziyi ayarla
      setFilteredSorunlar([...results.sorunlar]);
    } else {
      // Sorun yoksa boş dizi olarak ayarla (null değil)
      setFilteredSorunlar([]);
    }
  }, [results]);

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
            >
              {t.form.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-400 text-lg"
            >
              {t?.form?.description || 'Lastiğinizin durumunu analiz edin ve profesyonel öneriler alın'}
            </motion.p>
          </div>
          
          {/* Analysis Status */}
          {analyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-dark-300 rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-700 relative overflow-hidden"
              >
                {/* Arkaplan gradient animasyonu */}
              <motion.div
                  className="absolute inset-0 opacity-20 z-0"
                  initial={{ background: "linear-gradient(45deg, #ff4d4d 0%, #3b82f6 100%)" }}
                  animate={{ 
                    background: ["linear-gradient(45deg, #ff4d4d 0%, #3b82f6 100%)", 
                                "linear-gradient(225deg, #ff4d4d 0%, #3b82f6 100%)"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                />

                {/* Köşelerde dönen ışıklar */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    className="w-12 h-12 absolute -top-6 -left-6 rounded-full bg-primary/40 blur-md"
                    animate={{ 
                      top: ["-24px", "calc(100% - 24px)", "calc(100% - 24px)", "-24px"],
                      left: ["-24px", "-24px", "calc(100% - 24px)", "calc(100% - 24px)"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  </div>

                <div className="relative z-10">
                  {/* İmproved spinner */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Dış halka - yavaş dönen */}
                      <motion.div 
                        className="w-24 h-24 border-4 border-primary/30 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* Orta halka - orta hızda dönen */}
                      <motion.div 
                        className="w-20 h-20 border-4 border-primary/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* İç kısım - hızlı dönen */}
                      <motion.div 
                        className="w-16 h-16 border-4 border-t-primary border-r-primary/60 border-b-primary/40 border-l-primary/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-3">
                    {loading ? t.status.analyzingTire : t.status.uploadingImage}
                  </h2>
                  <p className="text-gray-300 mb-2">{t.status.pleaseWait}</p>
                  
                  {/* İlerleme göstergesi */}
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                    <motion.div
                      className="bg-primary h-2.5 rounded-full" 
                      initial={{ width: "5%" }}
                      animate={{ width: loading ? "100%" : "30%" }}
                      transition={{ 
                        duration: loading ? 30 : 3, 
                        ease: "easeInOut" 
                      }}
                    />
                  </div>
                  
                  {/* Tahmini süre bilgisi */}
                  <p className="text-xs text-gray-400">
                    {loading 
                      ? t.status.estimatedTime
                      : t.status.photoCheckTime}
                  </p>
                  </div>
                  </motion.div>
              </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormSection 
                formData={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
                handleKeyDown={handleKeyDown}
                fieldStatus={fieldStatus}
                getInputClassName={getInputClassName}
                t={t}
              />
              
              <ImageUploadSection 
                preview={preview}
                fileInputRef={fileInputRef}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                t={t}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                type="submit"
                onClick={async (e) => {
                  // Formun doğal submit olayını durdur
                  e.preventDefault(); 
                  
                  // Her test başlangıcında analiz verilerini temizle
                  await clearMemoryData();
                  
                  // Manuel olarak form submit et
                  handleSubmit(e);
                }}
                disabled={isAnalyzeButtonDisabled()}
                className={`
                  w-full py-4 px-6 rounded-lg text-white font-medium text-lg
                  ${isAnalyzeButtonDisabled() 
                    ? 'bg-gray-600/50 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary/90'
                  }
                  transition-all duration-300 shadow-lg
                  relative overflow-hidden group
                `}
              >
                {analyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{loading ? t.status.analyzing : 'Lastik tespit ediliyor...'}</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Lastik Sağlığını Analiz Et
                      </motion.span>
                    </span>
                    {!isAnalyzeButtonDisabled() && (
                      <motion.div 
                        className="absolute bottom-0 left-0 h-0.5 bg-white/30"
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: ["0%", "100%", "0%"],
                          x: ["0%", "0%", "100%"],
                          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                        }}
                      />
                    )}
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-red-500 text-center text-lg">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                  aria-label="Hata mesajını kapat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}

          {!analyzing && results && (
            <>
              <AnalysisResultsSection 
                results={results}
                filteredSorunlar={filteredSorunlar}
                setFilteredSorunlar={setFilteredSorunlar}
                formData={formData}
                t={t}
              />
              
              {/* Yapay Zeka Detaylı Analizi */}
              <AiAnalysisSection 
                detayliAnaliz={results?.detayliAnaliz}
                isLoading={isLoading} 
                t={t}
              />
              
              {/* Dışa Aktarma Bölümü */}
              <ExportAnalysisSection
                analizSonuclari={{
                  genelDurum: results.ozet || "İyi",
                  disDerinligi: 6.5,
                  yanakDurumu: "Normal",
                  asinmaOrani: 100 - (results.kullanimPuani || 0),
                  guvenlikSkoru: results.safetyScore || 85,
                  tahminiOmur: {
                    km: results.estimatedLifespan?.months ? results.estimatedLifespan.months * 1000 : 20000,
                    ay: results.estimatedLifespan?.months || 12
                  },
                  lastikBilgileri: {
                    marka: formData.marka || "Belirtilmemiş",
                    model: formData.model || "Belirtilmemiş",
                    boyut: formData.ebat || "Belirtilmemiş",
                    uretimYili: formData.uretimYili || ""
                  },
                  onerilenBakimlar: results?.oneriler || [],
                  sorunlar: results?.sorunlar?.map(sorun => sorun.description) || []
                }}
              />
            </>
          )}

          {/* Lastik Uzmanı Sohbet Bileşeni */}
          {results && <TireExpertChat analysisResults={results} formData={formData} />}
        </motion.div>
      </div>
    </main>
  );
} 