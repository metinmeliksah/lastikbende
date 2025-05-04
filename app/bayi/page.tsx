'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  BarChart, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function BayiDashboard() {
  const [stats, setStats] = useState({
    gunlukSatis: 12,
    aylikCiro: 34500,
    stokDurumu: 86,
    bekleyenSiparis: 7
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: '6234', musteri: 'Ahmet Yılmaz', tarih: '12 Mayıs 2023', tutar: 2450, durum: 'Tamamlandı' },
    { id: '6233', musteri: 'Mehmet Kaya', tarih: '11 Mayıs 2023', tutar: 1780, durum: 'Kargoda' },
    { id: '6232', musteri: 'Ayşe Demir', tarih: '10 Mayıs 2023', tutar: 3200, durum: 'Beklemede' },
    { id: '6231', musteri: 'Fatma Şahin', tarih: '9 Mayıs 2023', tutar: 960, durum: 'Tamamlandı' },
  ]);

  const [lowStockItems, setLowStockItems] = useState([
    { id: 1, urun: 'Michelin Primacy 4 205/55 R16', stok: 3, kritikSeviye: 5 },
    { id: 2, urun: 'Goodyear EfficientGrip 195/65 R15', stok: 2, kritikSeviye: 5 },
    { id: 3, urun: 'Bridgestone Turanza T005 225/45 R17', stok: 4, kritikSeviye: 5 },
  ]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="bayi-page-title">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Son güncelleme: Bugün, 15:30</span>
          <button className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Günlük Satış */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Günlük Satış</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.gunlukSatis}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+24%</span>
            <span className="text-gray-500 ml-1">geçen haftaya göre</span>
          </div>
        </div>

        {/* Aylık Ciro */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Aylık Ciro</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.aylikCiro.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <LineChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">geçen aya göre</span>
          </div>
        </div>

        {/* Stok Durumu */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Stok Durumu</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.stokDurumu}</h3>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <BarChart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-500 font-medium">Düşük Stok: 3 ürün</span>
          </div>
        </div>

        {/* Bekleyen Siparişler */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Bekleyen Siparişler</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.bekleyenSiparis}</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">İşlem bekleyen siparişler</span>
          </div>
        </div>
      </div>

      {/* Ana İçerik Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Siparişler */}
        <div className="lg:col-span-2 bayi-card">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Son Siparişler</h3>
            <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((siparis) => (
                  <tr key={siparis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">#{siparis.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.musteri}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.tarih}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.tutar.toLocaleString('tr-TR')} ₺</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        siparis.durum === 'Tamamlandı' 
                          ? 'bg-green-100 text-green-700' 
                          : siparis.durum === 'Kargoda' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {siparis.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kritik Stok Uyarısı */}
        <div className="bayi-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Kritik Stok Uyarısı</h3>
          </div>
          <div className="p-6 space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{item.urun}</h4>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (item.stok / item.kritikSeviye) < 0.5 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${(item.stok / item.kritikSeviye) * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs text-gray-500">{item.stok} adet</span>
                  </div>
                </div>
                <button className="ml-4 text-sm font-medium text-purple-600 hover:text-purple-800">
                  Sipariş Ver
                </button>
              </div>
            ))}

            <button className="w-full mt-4 py-2 bg-purple-50 text-purple-600 font-medium rounded-lg hover:bg-purple-100 transition-colors text-sm">
              Tüm Stok Durumunu Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 