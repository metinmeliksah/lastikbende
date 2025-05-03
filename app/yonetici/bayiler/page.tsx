'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

export default function Bayiler() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('tumu');
  
  // Örnek bayi verileri
  const [bayiler, setBayiler] = useState([
    { id: '1', firma: 'İstanbul Lastik A.Ş.', yetkili: 'Ahmet Yılmaz', email: 'ahmet@istanbullastik.com', telefon: '0212 555 66 77', durum: 'Aktif', sehir: 'İstanbul', kayitTarihi: '10 Ocak 2023' },
    { id: '2', firma: 'Ankara Oto Lastik', yetkili: 'Mehmet Kaya', email: 'mehmet@ankaralastik.com', telefon: '0312 444 33 22', durum: 'Aktif', sehir: 'Ankara', kayitTarihi: '15 Şubat 2023' },
    { id: '3', firma: 'İzmir Lastik Dünyası', yetkili: 'Ayşe Demir', email: 'ayse@izmirlastik.com', telefon: '0232 333 22 11', durum: 'Pasif', sehir: 'İzmir', kayitTarihi: '20 Mart 2023' },
    { id: '4', firma: 'Bursa Lastik Market', yetkili: 'Ali Yıldız', email: 'ali@bursalastik.com', telefon: '0224 222 11 00', durum: 'Aktif', sehir: 'Bursa', kayitTarihi: '5 Nisan 2023' },
    { id: '5', firma: 'Adana Oto Lastik', yetkili: 'Zeynep Şahin', email: 'zeynep@adanalastik.com', telefon: '0322 111 00 99', durum: 'Aktif', sehir: 'Adana', kayitTarihi: '12 Mayıs 2023' },
    { id: '6', firma: 'Konya Lastik Merkezi', yetkili: 'Mustafa Acar', email: 'mustafa@konyalastik.com', telefon: '0332 000 99 88', durum: 'Pasif', sehir: 'Konya', kayitTarihi: '18 Haziran 2023' },
    { id: '7', firma: 'Antep Lastik A.Ş.', yetkili: 'Fatma Çelik', email: 'fatma@anteplastik.com', telefon: '0342 999 88 77', durum: 'Aktif', sehir: 'Gaziantep', kayitTarihi: '24 Temmuz 2023' },
    { id: '8', firma: 'Samsun Oto Lastik', yetkili: 'Murat Demir', email: 'murat@samsunlastik.com', telefon: '0362 888 77 66', durum: 'Askıda', sehir: 'Samsun', kayitTarihi: '30 Ağustos 2023' },
  ]);

  // Filtreleme işlemi
  const filteredBayiler = bayiler.filter(bayi => {
    // Durum filtresi
    if (filter !== 'tumu' && filter !== bayi.durum.toLowerCase()) {
      return false;
    }
    
    // Arama filtresi
    if (searchQuery && !bayi.firma.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !bayi.yetkili.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !bayi.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !bayi.sehir.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !bayi.id.includes(searchQuery)) {
      return false;
    }
    
    return true;
  });

  // Sayfalama ayarları
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredBayiler.length / itemsPerPage);
  const displayedBayiler = filteredBayiler.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Bayi verilerini yenile
  const refreshBayiler = () => {
    setIsLoading(true);
    // Gerçekte burada API'den verileri yenileyecek
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Durum renklerini getir
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-700';
      case 'Pasif':
        return 'bg-red-100 text-red-700';
      case 'Askıda':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="yonetici-page-title">Bayiler</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshBayiler}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link 
            href="/yonetici/bayiler/ekle"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Bayi Ekle</span>
          </Link>
        </div>
      </div>

      {/* Arama ve Filtre Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Arama yap (Firma, yetkili, email, şehir)"
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
            onClick={() => setFilter('aktif')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'aktif' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Aktif</span>
            </div>
          </button>
          <button 
            onClick={() => setFilter('pasif')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'pasif' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>Pasif</span>
            </div>
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bayiler Tablosu */}
      <div className="yonetici-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yetkili</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şehir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedBayiler.map((bayi) => (
                <tr key={bayi.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">#{bayi.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{bayi.firma}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bayi.yetkili}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{bayi.email}</div>
                    <div>{bayi.telefon}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bayi.sehir}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bayi.kayitTarihi}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(bayi.durum)}`}>
                      {bayi.durum}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800" title="Görüntüle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-yellow-600 hover:text-yellow-800" title="Düzenle">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedBayiler.length === 0 && (
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
                        <p>Uygun bayi bulunamadı</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {filteredBayiler.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Toplam {filteredBayiler.length} bayiden {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBayiler.length)} arası gösteriliyor
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