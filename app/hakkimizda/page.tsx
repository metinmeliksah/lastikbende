'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Hakkımızda</h1>
          
          <div className="flex justify-center mb-8">
            <img
              src="/images/hakkimizda.jpg"
              alt="LastikBende Hakkımızda"
              className="max-w-xs w-full rounded-lg shadow-md"
            />
          </div>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Vizyonumuz</h2>
              <p className="text-gray-300 leading-relaxed">
                LastikBende olarak, araç sahiplerinin lastik bakımı ve güvenliği konusunda bilinçlenmesini sağlamak ve 
                en kaliteli lastik ürünlerini uygun fiyatlarla sunmak için çalışıyoruz. Teknolojinin gücünü kullanarak 
                lastik analizi ve bakımı konusunda yenilikçi çözümler sunmayı hedefliyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Misyonumuz</h2>
              <p className="text-gray-300 leading-relaxed">
                Müşterilerimize en iyi lastik deneyimini sunmak için sürekli kendimizi geliştiriyoruz. 
                Yapay zeka destekli analiz sistemimiz ile lastiklerinizin durumunu anlık olarak değerlendiriyor, 
                size özel bakım ve değişim önerileri sunuyoruz. Güvenliğiniz için en doğru lastik seçimini yapmanıza 
                yardımcı oluyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Değerlerimiz</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>• Müşteri memnuniyeti odaklı hizmet</p>
                <p>• Teknolojik yenilikçilik</p>
                <p>• Güvenilirlik ve şeffaflık</p>
                <p>• Kaliteli ürün ve hizmet</p>
                <p>• Sürdürülebilir çözümler</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Ekibimiz</h2>
              <p className="text-gray-300 leading-relaxed">
                Uzman ekibimiz, lastik teknolojisi ve otomotiv sektöründe yılların deneyimine sahiptir. 
                Mühendislerimiz, teknik uzmanlarımız ve satış ekibimiz, size en iyi hizmeti sunmak için 
                sürekli eğitim almakta ve kendilerini geliştirmektedir.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 