'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart,
  Download,
  Calendar,
  ChevronRight,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Maximize
} from 'lucide-react';
import Link from 'next/link';

interface RaporTipi {
  id: string;
  baslik: string;
  aciklama: string;
  icon: JSX.Element;
  renk: string;
  path: string;
}

export default function RaporlarSayfasi() {
  const [dateRange, setDateRange] = useState('Bu Ay');

  // Örnek istatistikler
  const stats = {
    toplamSatis: 56800,
    toplamSiparis: 38,
    ortalamaKar: 12800,
    satisArtisi: 14,
    topSatan: [
      { isim: 'Michelin Primacy 4 205/55 R16', adet: 32, tutar: 12800 },
      { isim: 'Bridgestone Turanza T005 225/45 R17', adet: 24, tutar: 9600 },
      { isim: 'Continental PremiumContact 6 215/55 R17', adet: 18, tutar: 7200 },
    ]
  };

  // Rapor tipleri
  const raporTipleri: RaporTipi[] = [
    {
      id: 'satis',
      baslik: 'Satış Raporu',
      aciklama: 'Günlük, haftalık veya aylık satış verilerini görüntüleyin',
      icon: <BarChart3 className="w-6 h-6" />,
      renk: 'bg-blue-500',
      path: '/bayi/raporlar/satis'
    },
    {
      id: 'stok',
      baslik: 'Stok Raporu',
      aciklama: 'Stok durumu, kritik seviyedeki ürünler ve stok hareketleri',
      icon: <PieChart className="w-6 h-6" />,
      renk: 'bg-purple-500',
      path: '/bayi/raporlar/stok'
    },
    {
      id: 'siparis',
      baslik: 'Sipariş Raporu',
      aciklama: 'Sipariş durumları, tamamlanma süreleri ve ödeme analizleri',
      icon: <LineChart className="w-6 h-6" />,
      renk: 'bg-green-500',
      path: '/bayi/raporlar/siparis'
    },
    {
      id: 'musteri',
      baslik: 'Müşteri Raporu',
      aciklama: 'Müşteri bazlı alışveriş analizi ve davranış raporları',
      icon: <BarChart3 className="w-6 h-6" />,
      renk: 'bg-orange-500',
      path: '/bayi/raporlar/musteri'
    },
    {
      id: 'gelir',
      baslik: 'Gelir Raporu',
      aciklama: 'Gelir, gider ve kar analizleri ile finansal raporlar',
      icon: <LineChart className="w-6 h-6" />,
      renk: 'bg-red-500',
      path: '/bayi/raporlar/gelir'
    },
    {
      id: 'performans',
      baslik: 'Performans Raporu',
      aciklama: 'Satış performansı, büyüme ve hedef analizleri',
      icon: <BarChart3 className="w-6 h-6" />,
      renk: 'bg-cyan-500',
      path: '/bayi/raporlar/performans'
    }
  ];

  // Örnek grafik verisi - Satış Trendi
  const satisTrendiAylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
  const satisTrendiDegerleri = [32000, 28000, 35000, 42000, 48000, 56800];

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Raporlar</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none bg-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Bu Hafta</option>
              <option>Bu Ay</option>
              <option>Son 3 Ay</option>
              <option>Son 6 Ay</option>
              <option>Bu Yıl</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
            <Download className="h-4 w-4 text-gray-500" />
            <span>Tüm Raporları İndir</span>
          </button>
        </div>
      </div>

      {/* Özet İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toplam Satış */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Toplam Satış</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{stats.toplamSatis.toLocaleString('tr-TR')} ₺</h3>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+{stats.satisArtisi}%</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Bu aydaki toplam satış tutarı
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Toplam Sipariş</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{stats.toplamSiparis} Adet</h3>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+8%</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Bu aydaki toplam sipariş adedi
          </div>
        </div>

        {/* Ortalama Kar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Ortalama Kar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{stats.ortalamaKar.toLocaleString('tr-TR')} ₺</h3>
            <div className="flex items-center text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">-3%</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Bu aydaki ortalama kar tutarı
          </div>
        </div>
      </div>

      {/* Ana Grafik - Satış Trendi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Satış Trendi</h3>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 h-80 flex items-end justify-between">
          {/* Basit bir çubuk grafik temsili */}
          {satisTrendiAylar.map((ay, index) => (
            <div key={index} className="flex flex-col items-center h-full">
              <div 
                className="w-12 bg-purple-500 rounded-t transition-all duration-500"
                style={{ 
                  height: `${(satisTrendiDegerleri[index] / Math.max(...satisTrendiDegerleri)) * 100}%`,
                  opacity: 0.7 + (index / 10)
                }}
              />
              <div className="text-xs text-gray-500 mt-2">{ay}</div>
              <div className="text-xs font-medium mt-1">{satisTrendiDegerleri[index].toLocaleString('tr-TR')} ₺</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rapor Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raporTipleri.map((rapor) => (
          <Link 
            key={rapor.id}
            href={rapor.path}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg text-white ${rapor.renk}`}>
                {rapor.icon}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{rapor.baslik}</h3>
            <p className="text-sm text-gray-600">{rapor.aciklama}</p>
          </Link>
        ))}
      </div>

      {/* En Çok Satan Ürünler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">En Çok Satan Ürünler</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {stats.topSatan.map((urun, index) => (
            <div key={index} className="px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                  'bg-amber-100 text-amber-700'
                } font-medium`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{urun.isim}</div>
                  <div className="text-sm text-gray-500">{urun.adet} adet satıldı</div>
                </div>
              </div>
              <div className="font-medium text-gray-800">{urun.tutar.toLocaleString('tr-TR')} ₺</div>
            </div>
          ))}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100">
          <Link 
            href="/bayi/raporlar/satis"
            className="text-purple-600 text-sm font-medium hover:text-purple-800 flex items-center"
          >
            Tüm ürün satışlarını görüntüle
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
} 