'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  BarChart, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Calendar,
  AlertCircle,
  HelpCircle,
  UserPlus
} from 'lucide-react';

export default function YoneticiDashboard() {
  const [stats, setStats] = useState({
    destekTalepleri: 8,
    toplamBayi: 24,
    aktifUye: 156,
    bekleyenSiparis: 12
  });

  const [recentTickets, setRecentTickets] = useState([
    { id: '8234', konu: 'Ödeme Sorunu', tarih: '12 Mayıs 2023', durum: 'Açık', bayi: 'İstanbul Lastik A.Ş.' },
    { id: '8233', konu: 'Sipariş İptali', tarih: '11 Mayıs 2023', durum: 'İşlemde', bayi: 'Ankara Oto Lastik' },
    { id: '8232', konu: 'Stok Bilgisi', tarih: '10 Mayıs 2023', durum: 'Kapalı', bayi: 'İzmir Lastik Dünyası' },
    { id: '8231', konu: 'Kargo Takibi', tarih: '9 Mayıs 2023', durum: 'Açık', bayi: 'Bursa Lastik Market' },
  ]);

  const [newDealers, setNewDealers] = useState([
    { id: 1, firma: 'Adana Oto Lastik', yetkili: 'Ahmet Yılmaz', tarih: '14 Mayıs 2023' },
    { id: 2, firma: 'Konya Lastik Merkezi', yetkili: 'Mehmet Kaya', tarih: '12 Mayıs 2023' },
    { id: 3, firma: 'Trabzon Lastik Dünyası', yetkili: 'Ayşe Demir', tarih: '10 Mayıs 2023' },
  ]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="yonetici-page-title">Yönetici Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Son güncelleme: Bugün, 15:30</span>
          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Destek Talepleri */}
        <div className="yonetici-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Destek Talepleri</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.destekTalepleri}</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+3</span>
            <span className="text-gray-500 ml-1">son 24 saatte</span>
          </div>
        </div>

        {/* Toplam Bayi */}
        <div className="yonetici-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Bayi</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.toplamBayi}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2</span>
            <span className="text-gray-500 ml-1">son hafta</span>
          </div>
        </div>

        {/* Aktif Üye */}
        <div className="yonetici-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Aktif Üye</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.aktifUye}</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+15</span>
            <span className="text-gray-500 ml-1">son hafta</span>
          </div>
        </div>

        {/* Bekleyen Siparişler */}
        <div className="yonetici-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Bekleyen Siparişler</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.bekleyenSiparis}</h3>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">İşlem bekleyen siparişler</span>
          </div>
        </div>
      </div>

      {/* Ana İçerik Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Destek Talepleri */}
        <div className="lg:col-span-2 yonetici-card">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Son Destek Talepleri</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">#{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.konu}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.bayi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.tarih}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        ticket.durum === 'Açık' 
                          ? 'bg-red-100 text-red-700' 
                          : ticket.durum === 'İşlemde' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {ticket.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Yeni Eklenen Bayiler */}
        <div className="yonetici-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Yeni Eklenen Bayiler</h3>
          </div>
          <div className="p-6 space-y-4">
            {newDealers.map((dealer) => (
              <div key={dealer.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{dealer.firma}</h4>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>{dealer.yetkili}</span>
                    <span className="mx-1">•</span>
                    <span>{dealer.tarih}</span>
                  </div>
                </div>
                <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                  Görüntüle
                </button>
              </div>
            ))}

            <button className="w-full mt-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm">
              Tüm Bayileri Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 