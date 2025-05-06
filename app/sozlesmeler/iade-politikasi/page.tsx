'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function ReturnPolicy() {
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
      const response = await fetch('/api/return-policy/pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iade-politikasi-v${currentVersion.version}.pdf`;
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
                İade Politikası
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
              <h2 className="text-2xl font-semibold text-primary mb-4">1. İade Koşulları</h2>
              <p className="text-gray-300 leading-relaxed">
                LastikBende olarak, müşterilerimizin memnuniyetini ön planda tutuyoruz. 
                Satın aldığınız ürünleri, aşağıdaki koşullar sağlandığında iade edebilirsiniz:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Ürün orijinal ambalajında ve kullanılmamış olmalıdır</p>
                <p>• İade talebi, ürün teslimat tarihinden itibaren 14 gün içinde yapılmalıdır</p>
                <p>• Ürünün faturası veya fişi ile birlikte iade edilmelidir</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. İade Süreci</h2>
              <p className="text-gray-300 leading-relaxed">
                İade sürecini başlatmak için aşağıdaki adımları takip edebilirsiniz:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>1. Müşteri hizmetlerimizle iletişime geçin</p>
                <p>2. İade nedeninizi belirtin</p>
                <p>3. Ürünü orijinal ambalajında hazırlayın</p>
                <p>4. Kargo firması ile ürünü bize gönderin</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. İade Ücreti</h2>
              <p className="text-gray-300 leading-relaxed">
                İade ücretleri aşağıdaki şekilde uygulanmaktadır:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Ürün hatası durumunda kargo ücreti tarafımızdan karşılanır</p>
                <p>• Müşteri kaynaklı iadelerde kargo ücreti müşteriye aittir</p>
                <p>• İade edilen ürünün bedeli, ödeme yapılan yönteme iade edilir</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. İade Edilemeyen Ürünler</h2>
              <p className="text-gray-300 leading-relaxed">
                Aşağıdaki durumlarda ürün iadesi kabul edilmemektedir:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Kullanılmış veya hasar görmüş ürünler</p>
                <p>• Orijinal ambalajı bozulmuş ürünler</p>
                <p>• 14 günlük iade süresi geçmiş ürünler</p>
                <p>• Özel sipariş ürünleri</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Değişim</h2>
              <p className="text-gray-300 leading-relaxed">
                Ürün değişimi için aşağıdaki koşullar geçerlidir:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Değişim talebi, ürün teslimat tarihinden itibaren 14 gün içinde yapılmalıdır</p>
                <p>• Değiştirilecek ürün orijinal ambalajında ve kullanılmamış olmalıdır</p>
                <p>• Değişim ürünü için kargo ücreti tarafımızdan karşılanır</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. İletişim</h2>
              <p className="text-gray-300 leading-relaxed">
                İade ve değişim işlemleri hakkında daha fazla bilgi için bizimle iletişime geçebilirsiniz:
              </p>
              <p className="text-gray-300 mt-2">
                E-posta: iade@lastikbende.com<br />
                Telefon: +90 (212) 123 45 67
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 