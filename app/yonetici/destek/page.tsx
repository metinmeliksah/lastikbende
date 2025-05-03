'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

export default function DestekTalepleri() {
  const [filter, setFilter] = useState('tumu');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Örnek destek talepleri verileri
  const [tickets, setTickets] = useState([
    { id: '9234', konu: 'Ödeme Sorunu', tarih: '12 Mayıs 2023', guncelleme: '13 Mayıs 2023', durum: 'Açık', oncelik: 'Yüksek', bayi: 'İstanbul Lastik A.Ş.' },
    { id: '9233', konu: 'Sipariş İptali', tarih: '11 Mayıs 2023', guncelleme: '12 Mayıs 2023', durum: 'İşlemde', oncelik: 'Orta', bayi: 'Ankara Oto Lastik' },
    { id: '9232', konu: 'Stok Bilgisi Hatası', tarih: '10 Mayıs 2023', guncelleme: '11 Mayıs 2023', durum: 'Kapalı', oncelik: 'Düşük', bayi: 'İzmir Lastik Dünyası' },
    { id: '9231', konu: 'Kargo Takibi Sorunu', tarih: '9 Mayıs 2023', guncelleme: '10 Mayıs 2023', durum: 'Açık', oncelik: 'Orta', bayi: 'Bursa Lastik Market' },
    { id: '9230', konu: 'Ürün İadesi', tarih: '8 Mayıs 2023', guncelleme: '9 Mayıs 2023', durum: 'İşlemde', oncelik: 'Yüksek', bayi: 'Adana Oto Lastik' },
    { id: '9229', konu: 'Stok Güncellemesi', tarih: '7 Mayıs 2023', guncelleme: '8 Mayıs 2023', durum: 'Kapalı', oncelik: 'Düşük', bayi: 'Konya Lastik Merkezi' },
    { id: '9228', konu: 'Sistem Erişim Sorunu', tarih: '6 Mayıs 2023', guncelleme: '7 Mayıs 2023', durum: 'Açık', oncelik: 'Kritik', bayi: 'Antep Lastik A.Ş.' },
    { id: '9227', konu: 'Fatura Düzeltme', tarih: '5 Mayıs 2023', guncelleme: '6 Mayıs 2023', durum: 'Kapalı', oncelik: 'Orta', bayi: 'Samsun Oto Lastik' },
  ]);

  // Filtreleme işlemi
  const filteredTickets = tickets.filter(ticket => {
    // Durum filtresi
    if (filter !== 'tumu' && filter !== ticket.durum.toLowerCase()) {
      return false;
    }
    
    // Arama filtresi
    if (searchQuery && !ticket.konu.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !ticket.bayi.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.id.includes(searchQuery)) {
      return false;
    }
    
    return true;
  });

  // Sayfalama ayarları
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const displayedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Destekleri yenile
  const refreshTickets = () => {
    setIsLoading(true);
    // Gerçekte burada API'den verileri yenileyecek
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Durum renklerini getir
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Açık':
        return 'bg-red-100 text-red-700';
      case 'İşlemde':
        return 'bg-yellow-100 text-yellow-700';
      case 'Kapalı':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Öncelik renklerini getir
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Kritik':
        return 'bg-red-100 text-red-700';
      case 'Yüksek':
        return 'bg-orange-100 text-orange-700';
      case 'Orta':
        return 'bg-blue-100 text-blue-700';
      case 'Düşük':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="yonetici-page-title">Destek Talepleri</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshTickets}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Arama ve Filtre Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Talep ara (ID, konu, bayi adı)"
            className="pl-10 w-full pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('tumu')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'tumu' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button 
            onClick={() => setFilter('açık')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'açık' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>Açık</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('işlemde')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'işlemde' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>İşlemde</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('kapalı')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'kapalı' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Kapalı</span>
            </div>
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Destek Talepleri Tablosu */}
      <div className="yonetici-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">#{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.konu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.bayi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.tarih}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.guncelleme}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.durum)}`}>
                      {ticket.durum}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.oncelik)}`}>
                      {ticket.oncelik}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button className="font-medium text-blue-600 hover:text-blue-500 mr-3">
                      Görüntüle
                    </button>
                    <button className="font-medium text-blue-600 hover:text-blue-500">
                      Yanıtla
                    </button>
                  </td>
                </tr>
              ))}
              {displayedTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span>Yükleniyor...</span>
                      </div>
                    ) : (
                      <div>
                        <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p>Uygun destek talebi bulunamadı</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {filteredTickets.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Toplam {filteredTickets.length} destek talebinden {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTickets.length)} arası gösteriliyor
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className={`p-2 rounded ${currentPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded ${currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 