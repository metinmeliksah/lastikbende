'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Gizlilik Politikası</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Giriş</h2>
              <p className="text-gray-300 leading-relaxed">
                LastikBende olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına büyük önem veriyoruz. 
                Bu gizlilik politikası, web sitemizi kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını 
                ve korunduğunu açıklamaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Toplanan Bilgiler</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Web sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>• Ad, soyad ve iletişim bilgileri</p>
                <p>• E-posta adresi</p>
                <p>• Telefon numarası</p>
                <p>• IP adresi ve tarayıcı bilgileri</p>
                <p>• Kullanım verileri ve tercihler</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Bilgilerin Kullanımı</h2>
              <p className="text-gray-300 leading-relaxed">
                Topladığımız bilgileri aşağıdaki amaçlar için kullanıyoruz:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Hizmetlerimizi sunmak ve iyileştirmek</p>
                <p>• Müşteri desteği sağlamak</p>
                <p>• Güvenliği sağlamak</p>
                <p>• Yasal yükümlülükleri yerine getirmek</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Veri Güvenliği</h2>
              <p className="text-gray-300 leading-relaxed">
                Kişisel verilerinizin güvenliği için uygun teknik ve organizasyonel önlemler alıyoruz. 
                Verileriniz, yetkisiz erişime, değiştirilmeye, ifşa edilmeye veya yok edilmeye karşı korunmaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Çerezler</h2>
              <p className="text-gray-300 leading-relaxed">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
                Çerezler hakkında daha fazla bilgi için Çerez Politikamızı inceleyebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Haklarınız</h2>
              <p className="text-gray-300 leading-relaxed">
                Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
              </p>
              <div className="text-gray-300 leading-relaxed space-y-4 mt-2">
                <p>• Verilerinize erişim hakkı</p>
                <p>• Düzeltme hakkı</p>
                <p>• Silme hakkı</p>
                <p>• İşlemeyi kısıtlama hakkı</p>
                <p>• Veri taşınabilirliği hakkı</p>
                <p>• İtiraz hakkı</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">7. İletişim</h2>
              <p className="text-gray-300 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, 
                lütfen bizimle iletişime geçin:
              </p>
              <p className="text-gray-300 mt-2">
                E-posta: privacy@lastikbende.com<br />
                Telefon: +90 (212) 123 45 67
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Değişiklikler</h2>
              <p className="text-gray-300 leading-relaxed">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. 
                Önemli değişiklikler yaptığımızda, web sitemizde uygun bir bildirim yayınlayacağız.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 