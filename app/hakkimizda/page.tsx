import React from 'react';

export default function Hakkimizda() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Hakkımızda</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Biz Kimiz?</h2>
          <p className="text-gray-600 mb-4">
            Lastik Bende, kaliteli ve güvenilir ikinci el lastiklere herkesin kolayca ulaşabilmesi için kuruldu.
            Sıfır lastik fiyatlarının yükselmesiyle birlikte, hem bütçesini korumak hem de çevreyi desteklemek isteyen kullanıcılar için en doğru alternatifi sunuyoruz.
          </p>
          <p className="text-gray-600 mb-4">
            Platformumuzda, özenle kontrol edilmiş, güvenlik standartlarına uygun ikinci el lastikleri bulabilir; aracınız için en doğru seçimi kolayca yapabilirsiniz.
            Satışa sunduğumuz her lastik, uzman ekiplerimiz tarafından detaylı bir kalite kontrol sürecinden geçirilir.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Misyonumuz</h2>
          <p className="text-gray-600 mb-4">
            Sürücülere ekonomik, güvenilir ve çevre dostu lastik alternatifleri sunarak hem bütçeye hem de doğaya katkı sağlamak.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Vizyonumuz</h2>
          <p className="text-gray-600 mb-4">
            İkinci el lastik pazarında güvenin ve kalite standartlarının temsilcisi olmak.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Neden Lastik Bende?</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Uygun fiyatlar</li>
            <li>Uzman onayı ve kalite kontrolü</li>
            <li>Geniş marka ve model seçenekleri</li>
            <li>Hızlı ve güvenli alışveriş deneyimi</li>
            <li>Çevreye duyarlı yaklaşım</li>
          </ul>
          <div className="mt-6 text-gray-600">
            <p className="font-medium">Lastik Bende ile doğru lastik, doğru fiyata ve güvenle sizlerle!</p>
            <p className="mt-2 font-medium">Yola çıkmadan önce mutlaka bize uğrayın!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 