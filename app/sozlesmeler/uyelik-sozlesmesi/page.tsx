'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Mail, Globe } from 'lucide-react';
import '../../i18n';
import { useTranslation } from 'react-i18next';

interface AgreementVersion {
  version: string;
  date: string;
  lastUpdated: string;
}

const MembershipAgreement = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<AgreementVersion>({
    version: '1.0.0',
    date: '2024-01-01',
    lastUpdated: '2024-01-01'
  });

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      // PDF indirme işlemi
      const response = await fetch('/api/agreement/pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uyelik-sozlesmesi-v${currentVersion.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t('agreement.title')}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Versiyon: {currentVersion.version}</span>
                <span>Geçerlilik: {currentVersion.date}</span>
                <span>Son Güncelleme: {currentVersion.lastUpdated}</span>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <button
                onClick={() => handleLanguageChange('tr')}
                className={`px-3 py-1 rounded-md ${
                  i18n.language === 'tr' 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-400 text-gray-400 hover:bg-dark-500'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded-md ${
                  i18n.language === 'en' 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-400 text-gray-400 hover:bg-dark-500'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-8">
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isLoading ? t('agreement.downloading') : t('agreement.download')}
            </button>
          </div>

          {/* Agreement Content */}
          <div className="prose prose-invert max-w-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sectionNumber) => (
              <section key={sectionNumber} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t(`agreement.sections.${sectionNumber}.title`)}
                </h2>
                <p className="text-gray-300">
                  {t(`agreement.sections.${sectionNumber}.content`)}
                </p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default MembershipAgreement; 