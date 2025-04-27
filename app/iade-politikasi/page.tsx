import React from 'react';

export default function IadePolitikasi() {
  return (
    <div className="min-h-screen bg-dark-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12">İade Politikası</h1>
        
        <div className="bg-dark-300 shadow-lg rounded-lg p-8 mb-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">1. İade Koşulları</h2>
              <p className="text-gray-300 text-lg">
                Lastik Bende olarak, müşterilerimizin memnuniyetini ön planda tutuyoruz.
                Ancak ikinci el lastiklerin özel durumu nedeniyle, aşağıdaki koşullar dışında iade kabul edilmemektedir:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-6 space-y-3 text-lg">
                <li>Ürünün teslim edildiği andaki durumu ile farklı olması</li>
                <li>Ürünün kusurlu veya hasarlı olması</li>
                <li>Ürünün yanlış ölçü veya modelde olması</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">2. İade Süreci</h2>
              <p className="text-gray-300 text-lg">
                İade talebiniz için aşağıdaki adımları takip etmeniz gerekmektedir:
              </p>
              <ol className="list-decimal list-inside text-gray-300 mt-6 space-y-3 text-lg">
                <li>İade talebinizi 3 iş günü içinde info@lastikbende.com adresine bildirin</li>
                <li>Ürünün orijinal durumunda ve ambalajında olması gerekmektedir</li>
                <li>Ürünün fotoğraflarını ve iade nedeninizi detaylı bir şekilde açıklayın</li>
                <li>İade talebiniz değerlendirildikten sonra size bilgi verilecektir</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">3. İade Edilemeyen Durumlar</h2>
              <p className="text-gray-300 text-lg">
                Aşağıdaki durumlarda iade kabul edilmemektedir:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-6 space-y-3 text-lg">
                <li>Ürünün kullanılmış olması</li>
                <li>Ürünün orijinal ambalajının zarar görmüş olması</li>
                <li>Ürünün montajı yapıldıktan sonra iade talebinde bulunulması</li>
                <li>Müşterinin kendi isteğiyle yanlış ürün seçimi yapması</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">4. Para İadesi</h2>
              <p className="text-gray-300 text-lg">
                İade talebiniz onaylandığında:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-6 space-y-3 text-lg">
                <li>Ödeme yaptığınız yöntem üzerinden iade işlemi gerçekleştirilir</li>
                <li>İade işlemi 7-14 iş günü içinde tamamlanır</li>
                <li>Kargo ücretleri iade kapsamında değildir</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">5. Değişim</h2>
              <p className="text-gray-300 text-lg">
                Ürün değişimi, aynı fiyat aralığındaki başka bir ürün için yapılabilir.
                Fiyat farkı olması durumunda, fark müşteri tarafından ödenir veya iade edilir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">6. Garanti</h2>
              <p className="text-gray-300 text-lg">
                İkinci el lastikler için üretici garantisi geçerli değildir.
                Ürünler, satış anındaki durumlarına göre değerlendirilir ve satılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 