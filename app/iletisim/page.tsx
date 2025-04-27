import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaGlobe, FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';

export default function Iletisim() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">İletişim</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <p className="text-gray-600 mb-6 text-center">
            Lastik Bende olarak her zaman size en iyi hizmeti sunmak için buradayız.
            Sorularınız, önerileriniz veya destek talepleriniz için bize aşağıdaki kanallardan ulaşabilirsiniz:
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">Adres</h3>
                <p className="text-gray-600">İstanbul, Türkiye</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaPhone className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">Telefon</h3>
                <p className="text-gray-600">+90 532 123 45 67</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">E-posta</h3>
                <p className="text-gray-600">destek@lastikbende.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaClock className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">Çalışma Saatleri</h3>
                <p className="text-gray-600">
                  Hafta içi: 09:00 – 18:00<br />
                  Cumartesi: 10:00 – 16:00<br />
                  Pazar: Kapalı
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaGlobe className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">Web Sitemiz</h3>
                <a href="https://www.lastikbende.com" className="text-blue-600 hover:underline">www.lastikbende.com</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Sosyal Medya</h3>
              <div className="flex space-x-4">
                <a href="https://instagram.com/lastikbende" className="text-gray-600 hover:text-blue-600">
                  <FaInstagram className="text-2xl" />
                </a>
                <a href="https://facebook.com/lastikbende" className="text-gray-600 hover:text-blue-600">
                  <FaFacebookF className="text-2xl" />
                </a>
                <a href="https://twitter.com/lastikbende" className="text-gray-600 hover:text-blue-600">
                  <FaTwitter className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">İletişim Formu</h2>
          <p className="text-gray-600 mb-6">
            İsterseniz aşağıdaki iletişim formunu doldurarak da bizimle kolayca iletişime geçebilirsiniz:
          </p>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">İsim</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Konu</label>
              <input
                type="text"
                id="subject"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mesajınız</label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Gönder
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            ✅ Formu gönderdiğinizde ekibimiz en kısa sürede size geri dönecektir.
          </p>
        </div>
      </div>
    </div>
  );
} 