'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';

interface AgreementVersion {
  version: string;
  date: string;
  lastUpdated: string;
}

const DistanceSalesAgreement = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion] = useState<AgreementVersion>({
    version: '1.0.0',
    date: '2024-01-01',
    lastUpdated: '2024-01-01'
  });

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      // PDF indirme işlemi
      const response = await fetch('/api/agreement/distance-sales-pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mesafeli-satis-sozlesmesi-v${currentVersion.version}.pdf`;
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
                Mesafeli Satış Sözleşmesi
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Versiyon: {currentVersion.version}</span>
                <span>Geçerlilik: {currentVersion.date}</span>
                <span>Son Güncelleme: {currentVersion.lastUpdated}</span>
              </div>
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
              {isLoading ? 'İndiriliyor...' : 'PDF İndir'}
            </button>
          </div>

          {/* Agreement Content */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                1. TARAFLAR
              </h2>
              <p className="text-gray-300">
                İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), bir tarafta LastikBende ("SATICI") ile diğer tarafta ("ALICI") arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde elektronik ortamda kurulmuştur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                2. KONU
              </h2>
              <p className="text-gray-300">
                İşbu Sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                3. ÜRÜN BİLGİLERİ
              </h2>
              <p className="text-gray-300">
                Ürünlere ilişkin temel özellikler internet sitesinde yer almaktadır. Satıcı, ürünlerin temel özelliklerini ve fiyatını değiştirme hakkını saklı tutar. Ürün seçenekleri ve fiyatı sipariş anında ALICI tarafından onaylanan son haliyle geçerlidir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                4. CAYMA HAKKI
              </h2>
              <p className="text-gray-300">
                ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, mal satışına ilişkin mesafeli sözleşmelerde teslimat tarihinden itibaren 14 (ondört) gün içerisinde malı reddederek sözleşmeden cayma hakkına sahiptir.
              </p>
            </section>
          </div>

          {/* Contact Button */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => router.push('/iletisim')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Sorularınız için İletişime Geçin
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default DistanceSalesAgreement; 