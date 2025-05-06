'use client';

import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaBuilding, FaUser, FaLock } from 'react-icons/fa';

export default function Contact() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-dark-500 to-primary/20 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">İletişim</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya herhangi bir konuda yardım için bizimle iletişime geçebilirsiniz. 
              Size en kısa sürede dönüş yapacağız.
            </p>
          </div>
        </div>
      </div>

      {/* İletişim Kutuları */}
      <div className="py-12 bg-dark-300">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-400 rounded-lg p-6 text-center hover:border-primary hover:border border border-gray-700 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaPhone className="text-primary text-2xl" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Telefon</h3>
              <p className="text-gray-300">+90 (212) 123 45 67</p>
              <p className="text-gray-400 mt-2 text-sm">Hafta içi 09:00 - 18:00</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-dark-400 rounded-lg p-6 text-center hover:border-primary hover:border border border-gray-700 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaEnvelope className="text-primary text-2xl" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">E-posta</h3>
              <p className="text-gray-300">info@lastikbende.com</p>
              <p className="text-gray-400 mt-2 text-sm">7/24 hizmetinizdeyiz</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-dark-400 rounded-lg p-6 text-center hover:border-primary hover:border border border-gray-700 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-primary text-2xl" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Adres</h3>
              <p className="text-gray-300">
                Örnek Mahallesi, Örnek Sokak No:123
                <br />
                Şişli, İstanbul
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* İletişim Formu ve Çalışma Saatleri */}
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* İletişim Formu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Bize Yazın</h2>
              <form className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Adınız Soyadınız"
                    className="bg-dark-300 w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="E-posta Adresiniz"
                    className="bg-dark-300 w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Şirket (İsteğe Bağlı)"
                    className="bg-dark-300 w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <textarea
                    placeholder="Mesajınız"
                    rows={5}
                    className="bg-dark-300 w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Mesajı Gönder
                </button>
              </form>
            </motion.div>

            {/* Kurumsal Bilgiler ve Çalışma Saatleri */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Kurumsal Bilgiler</h2>
              
              <div className="bg-dark-300 rounded-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Şirket Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaBuilding className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Lastik Bende Otomotiv San. ve Tic. A.Ş.</p>
                      <p className="text-gray-400 text-sm">Vergi No: 123456789</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">
                        Örnek Mahallesi, Örnek Sokak No:123<br />
                        Şişli, İstanbul
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Telefon: +90 (212) 123 45 67</p>
                      <p className="text-gray-300">Müşteri Destek: 0850 252 40 00</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaEnvelope className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">info@lastikbende.com</p>
                      <p className="text-gray-300">destek@lastikbende.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-300 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Çalışma Saatleri</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pazartesi - Cuma:</span>
                    <span className="text-gray-300">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cumartesi:</span>
                    <span className="text-gray-300">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pazar:</span>
                    <span className="text-gray-300">Kapalı</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Google Harita */}
      <div className="py-12 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Bizi Ziyaret Edin</h2>
          <div className="h-96 w-full rounded-lg overflow-hidden shadow-xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48168.83250295488!2d28.933251722656237!3d41.035074899999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zxZ5pxZ9saSwgxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1658487892942!5m2!1str!2str" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
} 