import React from 'react';

export default function KullanimSozlesmesi() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Kullanım Sözleşmesi</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Taraflar</h2>
              <p className="text-gray-600">
                Bu kullanım sözleşmesi, Lastik Bende ile web sitesini veya hizmetlerini kullanan kullanıcı arasında geçerlidir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Hizmet Tanımı</h2>
              <p className="text-gray-600">
                Lastik Bende, ikinci el lastiklerin satışa sunulduğu bir platformdur.
                Kullanıcılar, sitede listelenen ürünleri görüntüleyebilir, satın alabilir ve iletişim hizmetlerinden yararlanabilir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Kullanım Şartları</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Kullanıcılar, doğru ve güncel bilgi vermekle yükümlüdür.</li>
                <li>Satın alınan ürünlerin kullanımı tamamen kullanıcının sorumluluğundadır.</li>
                <li>Sitemizi kötü amaçlı kullanmak, yasalara aykırı içerik yüklemek veya diğer kullanıcıları rahatsız etmek yasaktır.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Ücretler ve Ödeme</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Satışa sunulan ürünler, belirtilen fiyatlar üzerinden satılır.</li>
                <li>Ödemeler, güvenli ödeme sistemleri üzerinden gerçekleştirilir.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Fikri Mülkiyet Hakları</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Web sitesinde yer alan tüm içerikler (metin, görseller, logo vb.) Lastik Bende'ye aittir.</li>
                <li>İzinsiz kullanım, kopyalama veya dağıtım yasaktır.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Sözleşmenin Feshi</h2>
              <p className="text-gray-600">
                Lastik Bende, kullanım şartlarına aykırı davranan kullanıcıların erişimini sınırlama veya sonlandırma hakkına sahiptir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Sorumluluk Reddi</h2>
              <p className="text-gray-600">
                İkinci el ürünler, kullanım ömrüne göre satılmaktadır.
                Ürünlerin kullanım süresi ve durumu hakkında bilgiler eksiksiz verilse de, kullanım sonrası oluşabilecek arızalardan Lastik Bende sorumlu tutulamaz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Değişiklikler</h2>
              <p className="text-gray-600">
                Lastik Bende, kullanım sözleşmesinde değişiklik yapma hakkını saklı tutar. Güncellemeler sitede yayınlandığı anda yürürlüğe girer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 