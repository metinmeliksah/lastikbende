'use client';

import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

export default function Contact() {
  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-300 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">İletişim</h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-primary mb-4">İletişim Bilgileri</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaPhone className="w-6 h-6 text-primary mt-1 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Telefon</h3>
                        <p className="text-gray-300">+90 (212) 123 45 67</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaEnvelope className="w-6 h-6 text-primary mt-1 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-white">E-posta</h3>
                        <p className="text-gray-300">info@lastikbende.com</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaMapMarkerAlt className="w-6 h-6 text-primary mt-1 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Adres</h3>
                        <p className="text-gray-300">
                          Örnek Mahallesi, Örnek Sokak No:123<br />
                          Şişli, İstanbul
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Çalışma Saatleri</h2>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <FaClock className="w-6 h-6 text-primary mt-1 mr-3" />
                      <div>
                        <p className="text-gray-300">Pazartesi - Cuma: 09:00 - 18:00</p>
                        <p className="text-gray-300">Cumartesi: 10:00 - 16:00</p>
                        <p className="text-gray-300">Pazar: Kapalı</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-primary mb-4">Bize Ulaşın</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Adınız Soyadınız</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="E-posta Adresiniz"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Mesajınız</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Mesajınızı buraya yazın"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
                  >
                    Gönder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 