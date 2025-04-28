'use client';

import { motion } from 'framer-motion';

export default function ReturnPolicy() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">İade Politikası</h1>
          
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