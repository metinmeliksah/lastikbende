import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFileWord, 
  FaFileExcel, 
  FaShare, 
  FaSpinner,
  FaFileDownload,
  FaTimes,
  FaFilePdf
} from 'react-icons/fa';
import { exportApi, type AnalizFormData } from '../lib/api';
import StatusTracker, { type Step } from './StatusTracker';
import PdfExporter from './PdfExporter';

interface ExportAnalysisSectionProps {
  analizSonuclari: {
    genelDurum: string;
    disDerinligi: number;
    yanakDurumu: string;
    asinmaOrani: number;
    guvenlikSkoru: number;
    tahminiOmur: {
      km: number;
      ay: number;
    };
    lastikBilgileri: {
      marka: string;
      model: string;
      boyut: string;
      uretimYili?: string;
    };
    onerilenBakimlar?: string[];
    sorunlar?: string[];
  };
}

const ExportAnalysisSection: React.FC<ExportAnalysisSectionProps> = ({ analizSonuclari }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Export işlemi için status tracking
  const [showModal, setShowModal] = useState(false);
  const [exportSteps, setExportSteps] = useState<Step[]>([
    { id: 'prepare', label: 'Veriler hazırlanıyor', status: 'waiting' },
    { id: 'generate', label: 'Dosya oluşturuluyor', status: 'waiting' },
    { id: 'download', label: 'Dosya indiriliyor', status: 'waiting' }
  ]);
  
  const updateStepStatus = (stepId: string, status: Step['status']) => {
    setExportSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const resetSteps = () => {
    setExportSteps([
      { id: 'prepare', label: 'Veriler hazırlanıyor', status: 'waiting' },
      { id: 'generate', label: 'Dosya oluşturuluyor', status: 'waiting' },
      { id: 'download', label: 'Dosya indiriliyor', status: 'waiting' }
    ]);
  };

  // Yedek yazdırma fonksiyonu - ana yöntem çalışmazsa kullanılır
  const performFallbackPrinting = (blob: Blob) => {
    try {
      // Yazdırma için PDF'i yeni sayfada aç ve yazdır
      const printUrl = window.URL.createObjectURL(blob);
      const printWindow = window.open(printUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          try {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
          } catch (printError) {
            console.error('Yazdırma hatası:', printError);
            setError('Yazdırma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
          }
        };
        // Yazdırma tamamlandı
        updateStepStatus('download', 'completed');
        setExportProgress(100);
        setSuccessMessage(`Rapor yazdırılıyor...`);
      } else {
        // Popup engellendi
        handlePopupBlocked(blob);
      }
    } catch (printError: any) {
      console.error('Yazdırma penceresi hatası:', printError);
      handlePopupBlocked(blob);
    }
  };

  // Popup engelleme durumunda alternatif işlemi yönetir
  const handlePopupBlocked = (blob: Blob) => {
    // Popup engellendiğinde kullanıcıya PDF indirme seçeneği sun
    setError('Yazdırma penceresi açılamadı. Tarayıcınız açılır pencereleri engelliyor olabilir. Raporu PDF olarak indirebilirsiniz.');
    updateStepStatus('download', 'error');
    
    // PDF olarak indirme seçeneği sun
    const downloadUrl = window.URL.createObjectURL(blob);
    const fileName = `lastik-analiz-yazdirma-${Date.now()}.pdf`;
    
    setSuccessMessage(
      `<div>Raporu PDF olarak indirmek için <a href="${downloadUrl}" download="${fileName}" class="text-primary underline font-medium">buraya tıklayın</a></div>`
    );
    
    // Başka bir HTML elementi ile yazdırma yönergesi göster
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.setAttribute('type', 'application/pdf');
      a.className = 'hidden';
      document.body.appendChild(a);
      // Otomatik indirme denemesi
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }, 1000);
  };

  const prepareExportData = (): AnalizFormData => {
      // Analiz verilerini hazırla
    return {
        lastikBilgileri: {
          marka: analizSonuclari.lastikBilgileri.marka,
          model: analizSonuclari.lastikBilgileri.model,
          boyut: analizSonuclari.lastikBilgileri.boyut,
          uretimYili: analizSonuclari.lastikBilgileri.uretimYili ? parseInt(analizSonuclari.lastikBilgileri.uretimYili) : undefined,
          kilometre: 50000 // Örnek değer, gerçek uygulamada formData'dan alınmalı
        },
        analizSonuclari: {
          genelDurum: analizSonuclari.genelDurum,
          disDerinligi: analizSonuclari.disDerinligi,
          yanakDurumu: analizSonuclari.yanakDurumu,
          asinmaOrani: analizSonuclari.asinmaOrani,
          guvenlikSkoru: analizSonuclari.guvenlikSkoru
        },
        tahminiBilgiler: {
          tahminiOmur: analizSonuclari.tahminiOmur,
          onerilenBakimlar: analizSonuclari.onerilenBakimlar || [
            "Rot balans kontrolü yapılmalı",
            "Lastik basınçları kontrol edilmeli",
            "Düzenli rotasyon önerilir"
          ],
          sorunlar: analizSonuclari.sorunlar ? analizSonuclari.sorunlar.map(sorun => ({ 
            type: "Sorun", 
            description: sorun, 
            severity: "medium" as "medium" | "low" | "high"
          })) : [
            { 
              type: "Aşınma", 
              description: "Dış tarafta düzensiz aşınma tespit edildi", 
              severity: "medium" 
            },
            { 
              type: "Basınç", 
              description: "Düşük basınç belirtileri tespit edildi", 
              severity: "high" 
            }
          ]
        },
        metaVeriler: {
          analizTarihi: new Date(),
          raporId: `lastik-${Date.now()}`,
          surumNo: "1.0"
        }
      };
  };

  const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    try {
      setIsExporting(format);
      setExportProgress(0);
      setSuccessMessage(null);
      setError(null);
      setShowModal(true);
      resetSteps();
      
      // Adım 1: Verileri hazırla
      updateStepStatus('prepare', 'processing');
      
      // Analiz verilerini hazırla
      const exportData = prepareExportData();
      
      // Veri hazırlığı tamamlandı
      updateStepStatus('prepare', 'completed');
      
      // Adım 2: Dosya oluşturma
      updateStepStatus('generate', 'processing');

      // İlerleme takibi için callback
      const handleProgress = (progress: number) => {
        setExportProgress(progress);
        
        // 50%'den az ilerleme -> oluşturma adımı
        // 50%'den fazla ilerleme -> indirme adımı
        if (progress >= 80 && exportSteps[2].status === 'waiting') {
          updateStepStatus('generate', 'completed');
          updateStepStatus('download', 'processing');
        }
      };

      // API ile dosya formatına göre export işlemini gerçekleştir
      let blob: Blob;
      let fileName: string;
      
      switch (format) {
        case 'word':
          blob = await exportApi.exportToWord(exportData, handleProgress);
          fileName = `lastik-analiz-${Date.now()}.docx`;
          break;
        case 'excel':
          blob = await exportApi.exportToExcel(exportData, handleProgress);
          fileName = `lastik-analiz-${Date.now()}.xlsx`;
          break;
        case 'pdf':
          blob = await exportApi.exportToPdf(exportData, false, handleProgress);
          fileName = `lastik-analiz-${Date.now()}.pdf`;
          break;
      }
      
      // Dosya oluşturma tamamlandı
      updateStepStatus('generate', 'completed');
      
      // Adım 3: Dosyayı indirme
      updateStepStatus('download', 'processing');
      
      try {
      // Dosyayı indir
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
        URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      // İndirme tamamlandı
      updateStepStatus('download', 'completed');
      
      // İlerlemeyi tamamla
      setExportProgress(100);
      
      // Format adını Türkçe olarak göster
        const formatNames: Record<string, string> = {
          'word': 'Word',
          'excel': 'Excel',
          'pdf': 'PDF'
        };
        
        setSuccessMessage(`${formatNames[format]} dosyası indiriliyor...`);
      } catch (downloadError) {
        console.error('İndirme hatası:', downloadError);
        updateStepStatus('download', 'error');
        setError('Dosya indirilemedi. Lütfen tekrar deneyin.');
      }
      
      // İşlem tamamlandı
      setTimeout(() => {
        setIsExporting(null);
        setExportProgress(0);
        setSuccessMessage(null);
        // Modal 2 saniye daha gösterilip kapanacak
        setTimeout(() => setShowModal(false), 2000);
      }, 1000);
      
    } catch (error: any) {
      console.error('Dışa aktarma hatası:', error);
      setError(`Dışa aktarma sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      setIsExporting(null);
      
      // Hata durumunda aktif adımı hata durumuna getir
      const activeStep = exportSteps.find(step => step.status === 'processing');
      if (activeStep) {
        updateStepStatus(activeStep.id, 'error');
      }
      
      // 3 saniye sonra modal'ı kapat
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  // Export Modal
  const ExportModal = () => (
    <AnimatePresence>
      {showModal && (
      <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
            <motion.div
            className="bg-dark-200 p-6 rounded-lg w-[90%] max-w-md shadow-lg relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button 
              onClick={() => {
                if (!isExporting) {
                  setShowModal(false);
                  setExportProgress(0);
                  setError(null);
                  setSuccessMessage(null);
                }
              }} 
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-4">
              {isExporting ? `${isExporting === 'word' ? 'Word' : isExporting === 'excel' ? 'Excel' : 'PDF'} Hazırlanıyor` : 'Dışa Aktarma'}
            </h3>
            
            {error ? (
              <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-md mb-4">
                {error}
              </div>
            ) : null}
            
            {successMessage ? (
              <div className="bg-green-900/30 border border-green-500 text-green-200 p-3 rounded-md mb-4 flex items-center">
                <div className="mr-2 text-green-400">
                  <FaFileDownload />
                </div>
                {successMessage.startsWith('<div>') ? (
                  <div dangerouslySetInnerHTML={{ __html: successMessage }} />
                ) : (
                  successMessage
              )}
            </div>
            ) : null}
            
            {isExporting && (
              <>
                <div className="mb-4">
                  <StatusTracker steps={exportSteps} />
                </div>
                
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
                
                <div className="text-center text-sm text-gray-400">
                  {exportProgress < 100 ? (
                    <>İşlem tamamlanana kadar lütfen bekleyin...</>
                  ) : (
                    <>İşlem tamamlandı!</>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="mt-8 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-dark-200 px-5 py-4 rounded-xl">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Analiz Raporunu Dışa Aktar</h3>
          <p className="text-sm text-gray-400">Analiz sonuçlarınızı farklı formatlarda dışa aktarın</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {/* WORD */}
          <button
            onClick={() => handleExport('word')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            disabled={!!isExporting}
          >
            <FaFileWord className="mr-2" /> Word
          </button>
          
          {/* EXCEL */}
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
            disabled={!!isExporting}
          >
            <FaFileExcel className="mr-2" /> Excel
          </button>
          
          {/* PDF */}
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
            disabled={!!isExporting}
          >
            <FaFilePdf className="mr-2" /> PDF
                </button>
              </div>
              </div>
              
      {/* Export Progress Modal */}
      <ExportModal />
    </div>
  );
};

export default ExportAnalysisSection; 