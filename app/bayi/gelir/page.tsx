'use client';

import { useState } from 'react';
import { 
  Calendar, 
  BarChart3, 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';

interface GelirData {
  ay: string;
  gelir: number;
  gider: number;
  kar: number;
}

export default function GelirTakibi() {
  const [dateRange, setDateRange] = useState('Bu Ay');
  
  const gelirData: GelirData[] = [
    { ay: 'Ocak', gelir: 42000, gider: 28000, kar: 14000 },
    { ay: 'Şubat', gelir: 38000, gider: 24000, kar: 14000 },
    { ay: 'Mart', gelir: 45000, gider: 30000, kar: 15000 },
    { ay: 'Nisan', gelir: 52000, gider: 32000, kar: 20000 },
    { ay: 'Mayıs', gelir: 58000, gider: 35000, kar: 23000 },
    { ay: 'Haziran', gelir: 62000, gider: 38000, kar: 24000 },
  ];

  // Toplam değerleri hesapla
  const toplamGelir = gelirData.reduce((sum, item) => sum + item.gelir, 0);
  const toplamGider = gelirData.reduce((sum, item) => sum + item.gider, 0);
  const toplamKar = gelirData.reduce((sum, item) => sum + item.kar, 0);

  // Karşılaştırma için değerler (önceki döneme göre)
  const gelirDegisim = +15; // yüzde
  const giderDegisim = +8; // yüzde
  const karDegisim = +22; // yüzde

  // En çok satılan ürünler
  const enCokSatilanlar = [
    { id: 1, urun: 'Michelin Primacy 4 205/55 R16', adet: 42, tutar: 65800 },
    { id: 2, urun: 'Bridgestone Turanza T005 225/45 R17', adet: 38, tutar: 59600 },
    { id: 3, urun: 'Continental PremiumContact 6 215/55 R17', adet: 35, tutar: 54600 },
    { id: 4, urun: 'Goodyear EfficientGrip Performance 195/65 R15', adet: 30, tutar: 40500 },
    { id: 5, urun: 'Pirelli Cinturato P7 225/50 R17', adet: 28, tutar: 45200 },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gelir Takibi</h1>
        
        <div className="flex flex-wrap gap-3">
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
            <Filter className="h-4 w-4 text-gray-500" />
            Filtrele
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            <Download className="h-4 w-4" />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gelir */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{toplamGelir.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CircleDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {gelirDegisim > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+{gelirDegisim}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">{gelirDegisim}%</span>
              </>
            )}
            <span className="text-gray-500 ml-1">önceki döneme göre</span>
          </div>
        </div>

        {/* Gider */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Gider</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{toplamGider.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <CircleDollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {giderDegisim > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">+{giderDegisim}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{giderDegisim}%</span>
              </>
            )}
            <span className="text-gray-500 ml-1">önceki döneme göre</span>
          </div>
        </div>

        {/* Net Kar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Kar</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{toplamKar.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {karDegisim > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+{karDegisim}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">{karDegisim}%</span>
              </>
            )}
            <span className="text-gray-500 ml-1">önceki döneme göre</span>
          </div>
        </div>
      </div>

      {/* Grafik ve Tablo Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gelir Grafiği */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Aylık Gelir ve Gider Analizi</h3>
          </div>
          <div className="p-6 h-80 flex items-end gap-4">
            {/* Basit bir çubuk grafik temsili */}
            {gelirData.map((veri, index) => (
              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full flex flex-col space-y-1 items-center">
                  <div className="w-full flex justify-center space-x-1">
                    <div 
                      className="w-5 bg-green-500 rounded-t" 
                      style={{ height: `${(veri.gelir / 70000) * 100}%` }}
                    />
                    <div 
                      className="w-5 bg-red-500 rounded-t" 
                      style={{ height: `${(veri.gider / 70000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{veri.ay}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100 flex justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Gelir</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Gider</span>
            </div>
          </div>
        </div>

        {/* En Çok Satılan Ürünler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">En Çok Satılan Ürünler</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {enCokSatilanlar.map((urun, index) => (
                <div key={urun.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-purple-100 text-purple-600'
                    } ${index < 3 ? 'text-white' : ''} text-xs font-medium`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-500">{urun.adet} adet</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">{urun.urun}</p>
                  <p className="text-sm text-gray-600">{urun.tutar.toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 