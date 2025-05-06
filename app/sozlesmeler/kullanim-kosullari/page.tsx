'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function KullanimKosullari() {
  const [isLoading, setIsLoading] = useState(false);
  const currentVersion = {
    version: '1.0.0',
    date: '2024-01-01',
    lastUpdated: '2024-01-01'
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      // PDF indirme işlemi (API entegrasyonu olduğunda burası güncellenecek)
      const response = await fetch('/api/terms/pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kullanim-kosullari-v${currentVersion.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      // API olmadığı için alternatif çözüm
      alert('PDF indirme özelliği şu anda aktif değil.');
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
                Kullanım Koşulları
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
              {isLoading ? 'İndiriliyor...' : 'PDF Olarak İndir'}
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Taraflar</h2>
              <p className="text-gray-300">
                Bu kullanım sözleşmesi, Lastik Bende ile web sitesini veya hizmetlerini kullanan kullanıcı arasında geçerlidir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Hizmet Tanımı</h2>
              <p className="text-gray-300">
                Lastik Bende, ikinci el lastiklerin satışa sunulduğu bir platformdur.
                Kullanıcılar, sitede listelenen ürünleri görüntüleyebilir, satın alabilir ve iletişim hizmetlerinden yararlanabilir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Kullanım Şartları</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Kullanıcılar, doğru ve güncel bilgi vermekle yükümlüdür.</li>
                <li>Satın alınan ürünlerin kullanımı tamamen kullanıcının sorumluluğundadır.</li>
                <li>Sitemizi kötü amaçlı kullanmak, yasalara aykırı içerik yüklemek veya diğer kullanıcıları rahatsız etmek yasaktır.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Ücretler ve Ödeme</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Satışa sunulan ürünler, belirtilen fiyatlar üzerinden satılır.</li>
                <li>Ödemeler, güvenli ödeme sistemleri üzerinden gerçekleştirilir.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Fikri Mülkiyet Hakları</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Web sitesinde yer alan tüm içerikler (metin, görseller, logo vb.) Lastik Bende'ye aittir.</li>
                <li>İzinsiz kullanım, kopyalama veya dağıtım yasaktır.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Sözleşmenin Feshi</h2>
              <p className="text-gray-300">
                Lastik Bende, kullanım şartlarına aykırı davranan kullanıcıların erişimini sınırlama veya sonlandırma hakkına sahiptir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Sorumluluk Reddi</h2>
              <p className="text-gray-300">
                İkinci el ürünler, kullanım ömrüne göre satılmaktadır.
                Ürünlerin kullanım süresi ve durumu hakkında bilgiler eksiksiz verilse de, kullanım sonrası oluşabilecek arızalardan Lastik Bende sorumlu tutulamaz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Değişiklikler</h2>
              <p className="text-gray-300">
                Lastik Bende, kullanım sözleşmesinde değişiklik yapma hakkını saklı tutar. Güncellemeler sitede yayınlandığı anda yürürlüğe girer.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 