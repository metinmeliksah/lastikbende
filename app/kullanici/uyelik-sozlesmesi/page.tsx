'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UyelikSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Üyelik Sözleşmesi</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Taraflar</h2>
              <p className="text-gray-300 leading-relaxed">
                İşbu Üyelik Sözleşmesi ("Sözleşme"), LastikBende platformu ("Platform") üzerinden hizmet veren [Şirket Adı] ("Şirket") ile Platformu kullanmak isteyen kullanıcı ("Üye") arasında düzenlenmiştir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Sözleşmenin Konusu</h2>
              <p className="text-gray-300 leading-relaxed">
                İşbu Sözleşme, Üye'nin Platform üzerinden sunulan lastik analizi ve önerisi hizmetlerinden yararlanmasına ilişkin şart ve koşulları düzenlemektedir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Üyelik Koşulları</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>3.1. Üye olmak için 18 yaşını doldurmuş olmak gerekmektedir.</p>
                <p>3.2. Üyelik için geçerli bir e-posta adresi ve telefon numarası gerekmektedir.</p>
                <p>3.3. Üye, kayıt sırasında verdiği bilgilerin doğru olduğunu kabul ve taahhüt eder.</p>
                <p>3.4. Platform'a üye olan kişi, işbu sözleşme hükümlerini kabul etmiş sayılır.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Hizmetlerin Kullanımı</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>4.1. Platform üzerinden sunulan lastik analizi hizmeti, yapay zeka teknolojileri kullanılarak gerçekleştirilmektedir.</p>
                <p>4.2. Analiz sonuçları tavsiye niteliğinde olup, nihai karar kullanıcıya aittir.</p>
                <p>4.3. Üye, Platform'u kötüye kullanmayacağını ve üçüncü kişilerin haklarını ihlal etmeyeceğini kabul eder.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Gizlilik ve Kişisel Verilerin Korunması</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>5.1. Üyenin kişisel verileri, KVKK kapsamında işlenmekte ve korunmaktadır.</p>
                <p>5.2. Platform'un Gizlilik Politikası, işbu sözleşmenin ayrılmaz bir parçasıdır.</p>
                <p>5.3. Üyenin verileri, hizmet kalitesini artırmak ve yasal yükümlülükleri yerine getirmek amacıyla kullanılmaktadır.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Fikri Mülkiyet Hakları</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>6.1. Platform üzerindeki tüm içerik ve yazılımlar Şirket'in fikri mülkiyetindedir.</p>
                <p>6.2. Üye, Platform'un içeriğini kopyalamamayı ve izinsiz kullanmamayı kabul eder.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Sözleşmenin Feshi</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>7.1. Üye, dilediği zaman üyeliğini sonlandırabilir.</p>
                <p>7.2. Şirket, sözleşme şartlarının ihlali durumunda üyeliği sonlandırma hakkına sahiptir.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Uyuşmazlıkların Çözümü</h2>
              <p className="text-gray-300 leading-relaxed">
                İşbu sözleşmeden doğan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti mahkemeleri yetkilidir.
              </p>
            </section>

            <div className="mt-12 text-center">
              <Link 
                href="/kullanici/kayit"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 