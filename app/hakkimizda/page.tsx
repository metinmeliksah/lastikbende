'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaBuilding, FaLightbulb, FaChartLine, FaGlobe } from 'react-icons/fa';

export default function About() {
  const timelineItems = [
    { year: 4, title: 'Sektördeki Yılımız', icon: FaCalendarAlt },
    { year: 7, title: 'Uzman Ekip', icon: FaUsers },
    { year: 10, title: 'Bayi Sayısı', icon: FaBuilding },
    { year: 13, title: 'Yenilik', icon: FaLightbulb },
    { year: 21, title: 'Aylık Satış', icon: FaChartLine },
    { year: 23, title: 'Ulusal Pazar Payı', icon: FaGlobe }
  ];

  const teamMembers = [
    {
      name: 'Ahmet Yılmaz',
      position: 'Genel Müdür',
      image: '/placeholder.jpg',
    },
    {
      name: 'Mehmet Demir',
      position: 'Teknik Direktör',
      image: '/placeholder.jpg',
    },
    {
      name: 'Ayşe Kaya',
      position: 'Pazarlama Müdürü',
      image: '/placeholder.jpg',
    },
    {
      name: 'Zeynep Şahin',
      position: 'Finans Direktörü',
      image: '/placeholder.jpg',
    },
    {
      name: 'Mustafa Çelik',
      position: 'Operasyon Müdürü',
      image: '/placeholder.jpg',
    },
    {
      name: 'Elif Yıldız',
      position: 'İnsan Kaynakları Müdürü',
      image: '/placeholder.jpg',
    }
  ];

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      {/* Hero Bölümü */}
      <section className="bg-gradient-to-r from-dark-500 to-primary/20 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Sürdürülebilir Yarınlar İçin <span className="text-primary">Lastik Bende</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-gray-300 text-lg mb-6"
              >
                Tire analiz teknolojimiz ile kullanıcılara daha güvenli, daha ekonomik ve çevreye duyarlı lastik kullanımı sunuyoruz.
              </motion.p>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg overflow-hidden shadow-xl"
              >
                <Image 
                  src="/locales/hakkimizda.jpeg" 
                  alt="LastikBende Hakkımızda" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Zaman Çizelgesi Bölümü */}
      <section className="py-16 bg-dark-300">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-white mb-12"
          >
            Rakamlarla <span className="text-primary">LastikBende</span>
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {timelineItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center bg-dark-400 rounded-lg p-6 shadow-lg border border-gray-700"
              >
                <item.icon className="text-primary text-3xl mb-3" />
                <span className="text-4xl font-bold text-white mb-2">{item.year}</span>
                <span className="text-gray-400 text-center text-sm">{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* İçerik Bölümü */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-300 p-6 rounded-lg shadow-lg border border-gray-700"
            >
              <h3 className="text-2xl font-semibold text-primary mb-4">Vizyonumuz</h3>
              <p className="text-gray-300 leading-relaxed">
                LastikBende olarak, araç sahiplerinin lastik bakımı ve güvenliği konusunda bilinçlenmesini sağlamak ve 
                en kaliteli lastik ürünlerini uygun fiyatlarla sunmak için çalışıyoruz. Teknolojinin gücünü kullanarak 
                lastik analizi ve bakımı konusunda yenilikçi çözümler sunmayı hedefliyoruz.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-300 p-6 rounded-lg shadow-lg border border-gray-700"
            >
              <h3 className="text-2xl font-semibold text-primary mb-4">Misyonumuz</h3>
              <p className="text-gray-300 leading-relaxed">
                Müşterilerimize en iyi lastik deneyimini sunmak için sürekli kendimizi geliştiriyoruz. 
                Yapay zeka destekli analiz sistemimiz ile lastiklerinizin durumunu anlık olarak değerlendiriyor, 
                size özel bakım ve değişim önerileri sunuyoruz. Güvenliğiniz için en doğru lastik seçimini yapmanıza 
                yardımcı oluyoruz.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-300 p-6 rounded-lg shadow-lg border border-gray-700 mb-12"
          >
            <h3 className="text-2xl font-semibold text-primary mb-4">Değerlerimiz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Müşteri memnuniyeti odaklı hizmet</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Teknolojik yenilikçilik</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Güvenilirlik ve şeffaflık</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Kaliteli ürün ve hizmet</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Sürdürülebilir çözümler</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">• Çevre dostu yaklaşım</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ekip Bölümü */}
      <section className="py-16 bg-dark-300">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-white mb-12"
          >
            Yönetim <span className="text-primary">Kadromuz</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-400 rounded-lg overflow-hidden shadow-lg border border-gray-700"
              >
                <div className="h-64 relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white">{member.name}</h3>
                  <p className="text-primary">{member.position}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 