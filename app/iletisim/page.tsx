import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaGlobe, FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';

export default function Iletisim() {
  return (
    <div className="min-h-screen bg-dark-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12">İletişim</h1>
        
        <div className="bg-dark-300 shadow-lg rounded-lg p-8 mb-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <FaEnvelope className="text-primary text-2xl" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">E-posta</h3>
                    <p className="text-gray-300 text-lg">info@lastikbende.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <FaPhone className="text-primary text-2xl" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Telefon</h3>
                    <p className="text-gray-300 text-lg">+90 532 123 45 67</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <FaMapMarkerAlt className="text-primary text-2xl" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Adres</h3>
                    <p className="text-gray-300 text-lg">
                      Örnek Mahallesi, Örnek Sokak No:123<br />
                      Kadıköy/İstanbul
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <FaClock className="text-primary text-2xl" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Çalışma Saatleri</h3>
                    <p className="text-gray-300 text-lg">
                      Pazartesi - Cumartesi: 09:00 - 18:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Bize Ulaşın</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-lg font-medium text-white mb-2">
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-white mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="E-posta Adresiniz"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-lg font-medium text-white mb-2">
                    Konu
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Konu"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-lg font-medium text-white mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition duration-300"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 