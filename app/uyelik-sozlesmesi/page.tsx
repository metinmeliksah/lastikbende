'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';
import '../i18n';
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
  const [currentVersion] = useState<AgreementVersion>({
    version: '1.0.0',
    date: '2024-01-01',
    lastUpdated: '2024-01-01'
  });

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agreement/pdf', {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('PDF indirme hatası');
      }

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
          <div></div> className="space-y-6"{'>'}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Üyelik Koşulları</h2>
              <p className="text-gray-600">
                Lastik Bende platformuna üye olarak, aşağıdaki koşulları kabul etmiş sayılırsınız:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>18 yaşından büyük olduğunuzu</li>
                <li>Verdiğiniz bilgilerin doğru ve güncel olduğunu</li>
                <li>Platform kurallarına uyacağınızı</li>
                <li>Gizlilik politikamızı kabul ettiğinizi</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Üye Hakları ve Sorumlulukları</h2>
              <p className="text-gray-600">
                Üyelerimizin hakları ve sorumlulukları aşağıdaki gibidir:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>Hesap bilgilerinizi güvenli tutmak</li>
                <li>Platformu yasalara uygun kullanmak</li>
                <li>Diğer kullanıcılara saygılı olmak</li>
                <li>İade ve değişim politikalarına uymak</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Gizlilik ve Veri Kullanımı</h2>
              <p className="text-gray-600">
                Kişisel verilerinizin kullanımı ve korunması hakkında:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>Kişisel bilgileriniz güvenli bir şekilde saklanır</li>
                <li>SSL şifreleme teknolojisi kullanılır</li>
                <li>Verileriniz üçüncü şahıslarla paylaşılmaz</li>
                <li>Çerez kullanımı hakkında bilgilendirilirsiniz</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. İade ve Değişim Politikası</h2>
              <p className="text-gray-600">
                Ürün iade ve değişim koşulları:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>İade talepleri 3 iş günü içinde bildirilmelidir</li>
                <li>Ürün orijinal durumunda olmalıdır</li>
                <li>İkinci el lastikler için özel koşullar geçerlidir</li>
                <li>Kargo ücretleri iade kapsamında değildir</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. İletişim ve Destek</h2>
              <p className="text-gray-600">
                Bize ulaşabileceğiniz kanallar:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
                <li>E-posta: destek@lastikbende.com</li>
                <li>Telefon: +90 532 123 45 67</li>
                <li>Çalışma Saatleri: Hafta içi 09:00-18:00</li>
                <li>Sosyal Medya: @lastikbende</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Sözleşme Değişiklikleri</h2>
              <p className="text-gray-600">
                Lastik Bende, bu sözleşmeyi önceden haber vermeksizin değiştirme hakkını saklı tutar.
                Değişiklikler platform üzerinden duyurulur ve yürürlüğe girdiği tarihten itibaren geçerli olur.
              </p>
            </div>
          <div className="prose prose-invert max-w-none">
            {Object.keys(t('agreement.sections', { returnObjects: true })).map((sectionKey) => (
              <section key={sectionKey} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t(`agreement.sections.${sectionKey}.title`)}
                </h2>
                <p className="text-gray-300">
                  {t(`agreement.sections.${sectionKey}.content`)}
                </p>
              </section>
            ))}
          </div>

          {/* Contact Button */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => router.push('/iletisim')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {t('agreement.contact')}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default MembershipAgreement; 