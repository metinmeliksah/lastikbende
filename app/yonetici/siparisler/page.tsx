'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  PackageCheck,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function Siparisler() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('tumu');
  const [dateFilter, setDateFilter] = useState('tum-zamanlar');
  
  // Örnek sipariş verileri
  const [siparisler, setSiparisler] = useState([
    { 
      id: 'SIP-2023-001', 
      bayi: 'Lastik Dünyası', 
      bayiId: 'B001',
      tarih: '15 Mayıs 2023, 14:30', 
      tutar: '12,450 TL', 
      odemeDurumu: 'Ödendi', 
      teslimatDurumu: 'Tamamlandı', 
      urunler: 4,
      adres: 'İstanbul / Kadıköy'
    },
    { 
      id: 'SIP-2023-002', 
      bayi: 'Auto Lastik', 
      bayiId: 'B003',
      tarih: '14 Mayıs 2023, 11:15', 
      tutar: '8,230 TL', 
      odemeDurumu: 'Ödendi', 
      teslimatDurumu: 'Kargoda', 
      urunler: 3,
      adres: 'Ankara / Çankaya'
    },
    { 
      id: 'SIP-2023-003', 
      bayi: 'Merkez Oto', 
      bayiId: 'B005',
      tarih: '13 Mayıs 2023, 09:45', 
      tutar: '5,780 TL', 
      odemeDurumu: 'Bekliyor', 
      teslimatDurumu: 'Hazırlanıyor', 
      urunler: 2,
      adres: 'İzmir / Bornova'
    },
    { 
      id: 'SIP-2023-004', 
      bayi: 'Lastik Merkezi', 
      bayiId: 'B008',
      tarih: '12 Mayıs 2023, 16:20', 
      tutar: '9,350 TL', 
      odemeDurumu: 'Ödendi', 
      teslimatDurumu: 'Hazırlanıyor', 
      urunler: 3,
      adres: 'Bursa / Osmangazi'
    },
    { 
      id: 'SIP-2023-005', 
      bayi: 'Lastik Pro', 
      bayiId: 'B010',
      tarih: '10 Mayıs 2023, 10:10', 
      tutar: '14,620 TL', 
      odemeDurumu: 'İptal', 
      teslimatDurumu: 'İptal', 
      urunler: 5,
      adres: 'Antalya / Muratpaşa'
    },
    { 
      id: 'SIP-2023-006', 
      bayi: 'Lastik Dünyası', 
      bayiId: 'B001',
      tarih: '09 Mayıs 2023, 14:05', 
      tutar: '6,890 TL', 
      odemeDurumu: 'Ödendi', 
      teslimatDurumu: 'Tamamlandı', 
      urunler: 2,
      adres: 'İstanbul / Kadıköy'
    },
  ]);

  // Filtreleme işlemi
  const filteredSiparisler = siparisler.filter(siparis => {
    // Teslimat durumu filtresi
    if (filter !== 'tumu') {
      switch(filter) {
        case 'tamamlandi':
          if (siparis.teslimatDurumu !== 'Tamamlandı') return false;
          break;
        case 'kargoda':
          if (siparis.teslimatDurumu !== 'Kargoda') return false;
          break;
        case 'hazirlaniyor':
          if (siparis.teslimatDurumu !== 'Hazırlanıyor') return false;
          break;
        case 'iptal':
          if (siparis.teslimatDurumu !== 'İptal') return false;
          break;
      }
    }
    
    // Arama filtresi
    if (searchQuery && !siparis.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !siparis.bayi.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !siparis.bayiId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !siparis.adres.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sayfalama ayarları
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSiparisler.length / itemsPerPage);
  const displayedSiparisler = filteredSiparisler.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sipariş verilerini yenile
  const refreshSiparisler = () => {
    setIsLoading(true);
    // Gerçekte burada API'den verileri yenileyecek
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Teslimat durumu renklerini getir
  const getTeslimatStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-700';
      case 'Kargoda':
        return 'bg-blue-100 text-blue-700';
      case 'Hazırlanıyor':
        return 'bg-yellow-100 text-yellow-700';
      case 'İptal':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Ödeme durumu renklerini getir
  const getOdemeStatusColor = (status: string) => {
    switch (status) {
      case 'Ödendi':
        return 'bg-green-100 text-green-700';
      case 'Bekliyor':
        return 'bg-yellow-100 text-yellow-700';
      case 'İptal':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Teslimat durumu ikonunu getir
  const getTeslimatIcon = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return <CheckCircle className="w-4 h-4" />;
      case 'Kargoda':
        return <Truck className="w-4 h-4" />;
      case 'Hazırlanıyor':
        return <Package className="w-4 h-4" />;
      case 'İptal':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="yonetici-page-title">Siparişler</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshSiparisler}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Sipariş</p>
            <p className="text-2xl font-bold text-gray-800">{siparisler.length}</p>
          </div>
        </div>
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tamamlanan</p>
            <p className="text-2xl font-bold text-gray-800">
              {siparisler.filter(s => s.teslimatDurumu === 'Tamamlandı').length}
            </p>
          </div>
        </div>
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Hazırlanan</p>
            <p className="text-2xl font-bold text-gray-800">
              {siparisler.filter(s => s.teslimatDurumu === 'Hazırlanıyor').length}
            </p>
          </div>
        </div>
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kargoda</p>
            <p className="text-2xl font-bold text-gray-800">
              {siparisler.filter(s => s.teslimatDurumu === 'Kargoda').length}
            </p>
          </div>
        </div>
      </div>

      {/* Arama ve Filtre Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Arama yap (Sipariş No, Bayi, Adres)"
            className="pl-10 w-full pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
            onClick={() => setFilter('tamamlandi')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'tamamlandi' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Tamamlanan</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('kargoda')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'kargoda' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>Kargoda</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('hazirlaniyor')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'hazirlaniyor' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>Hazırlanıyor</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('iptal')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'iptal' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              <span>İptal</span>
            </div>
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tarih Filtreleme */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setDateFilter('tum-zamanlar')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            dateFilter === 'tum-zamanlar' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tüm Zamanlar
        </button>
        <button 
          onClick={() => setDateFilter('bugun')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            dateFilter === 'bugun' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bugün
        </button>
        <button 
          onClick={() => setDateFilter('bu-hafta')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            dateFilter === 'bu-hafta' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bu Hafta
        </button>
        <button 
          onClick={() => setDateFilter('bu-ay')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            dateFilter === 'bu-ay' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bu Ay
        </button>
        <button 
          onClick={() => setDateFilter('son-3-ay')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            dateFilter === 'son-3-ay' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Son 3 Ay
        </button>
        <div className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Özel Tarih</span>
        </div>
      </div>

      {/* Siparişler Tablosu */}
      <div className="yonetici-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teslimat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedSiparisler.map((siparis) => (
                <tr key={siparis.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/yonetici/siparisler/${siparis.id}`} className="hover:underline">
                      {siparis.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <div className="font-medium">{siparis.bayi}</div>
                    <div className="text-xs text-gray-500">{siparis.bayiId}</div>
                    <div className="text-xs text-gray-500">{siparis.adres}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.tarih}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{siparis.tutar}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-800">{siparis.urunler}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getOdemeStatusColor(siparis.odemeDurumu)}`}>
                      {siparis.odemeDurumu}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium items-center ${getTeslimatStatusColor(siparis.teslimatDurumu)}`}>
                      {getTeslimatIcon(siparis.teslimatDurumu)}
                      <span className="ml-1">{siparis.teslimatDurumu}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800" title="Görüntüle">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedSiparisler.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span>Yükleniyor...</span>
                      </div>
                    ) : (
                      <div>
                        <ShoppingBag className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p>Sipariş bulunamadı</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {filteredSiparisler.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Toplam {filteredSiparisler.length} siparişten {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSiparisler.length)} arası gösteriliyor
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