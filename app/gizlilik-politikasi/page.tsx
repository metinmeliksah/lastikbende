import React from 'react';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

export default function GizlilikPolitikasi() {
  return (
    <div className="min-h-screen bg-dark-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12">Gizlilik Politikası</h1>
        
        <div className="bg-dark-300 shadow-lg rounded-lg p-8 mb-8">
          <p className="text-gray-300 mb-8 text-lg">
            Lastik Bende olarak, müşterilerimizin gizliliğine büyük önem veriyoruz.
            Bu gizlilik politikası, web sitemizi veya hizmetlerimizi kullanırken hangi bilgilerin toplandığını, 
            bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">1. Topladığımız Bilgiler</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
                <li>Kişisel Bilgiler: Ad, soyad, telefon numarası, e-posta adresi, teslimat adresi gibi bilgiler.</li>
                <li>İşlem Bilgileri: Satın alma işlemleri, ödeme bilgileri ve sipariş geçmişi.</li>
                <li>Teknik Bilgiler: IP adresi, tarayıcı türü, cihaz bilgileri ve site kullanım verileri.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">2. Bilgileri Nasıl Kullanıyoruz?</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
                <li>Siparişlerinizi işlemek ve teslim etmek</li>
                <li>Müşteri desteği sağlamak</li>
                <li>Size özel kampanya ve bilgilendirme göndermek</li>
                <li>Hizmetlerimizi geliştirmek ve kullanıcı deneyimini iyileştirmek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">3. Bilgilerin Paylaşımı</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Lastik Bende, kişisel bilgilerinizi hiçbir şekilde üçüncü şahıslarla satmaz, kiralamaz veya paylaşmaz.
                Ancak, aşağıdaki durumlarda bilgilerinizi paylaşabiliriz:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
                <li>Yasal zorunluluklar</li>
                <li>Sipariş teslimatı için lojistik firmalarıyla</li>
                <li>Ödeme işlemleri için güvenli ödeme hizmet sağlayıcılarıyla</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">4. Bilgilerin Korunması</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
                <li>Kişisel bilgilerinizin güvenliği için güncel güvenlik önlemleri alınmaktadır.</li>
                <li>Veri kaybını, izinsiz erişimi ve kötüye kullanımı önlemek için SSL şifreleme teknolojisi kullanıyoruz.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">5. Çerezler (Cookies)</h2>
              <p className="text-gray-300 text-lg">
                Web sitemizde kullanıcı deneyimini artırmak için çerezler kullanılmaktadır.
                Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilir veya reddedebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">6. Üçüncü Taraf Bağlantıları</h2>
              <p className="text-gray-300 text-lg">
                Web sitemiz, üçüncü taraf sitelere bağlantılar içerebilir. Bu sitelerin gizlilik uygulamalarından Lastik Bende sorumlu değildir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">7. Kullanıcı Hakları</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
                <li>Kişisel verilerinize erişim talep etme</li>
                <li>Yanlış veya eksik bilgileri düzeltme</li>
                <li>Verilerinizin silinmesini talep etme</li>
                <li>Pazarlama iletişimlerinden çıkma hakkına sahipsiniz.</li>
              </ul>
              <p className="text-gray-300 mt-6 text-lg">
                Talepleriniz için bizimle aşağıdaki iletişim kanallarından iletişime geçebilirsiniz.
              </p>
            </div>

            <div className="bg-dark-200 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">İletişim</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-primary text-xl" />
                  <span className="text-gray-300 text-lg">destek@lastikbende.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-primary text-xl" />
                  <span className="text-gray-300 text-lg">+90 532 123 45 67</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 