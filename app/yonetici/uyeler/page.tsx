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
  Edit,
  Trash2,
  Eye,
  User,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import Link from 'next/link';

export default function Uyeler() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('tumu');
  
  // Örnek üye verileri
  const [uyeler, setUyeler] = useState([
    { id: '1001', ad: 'Ali Yılmaz', email: 'ali@gmail.com', telefon: '0554 123 4567', kayitTarihi: '10 Ocak 2023', sonGiris: '15 Mayıs 2023, 14:30', durum: 'Aktif', siparisler: 12 },
    { id: '1002', ad: 'Ayşe Demir', email: 'ayse@hotmail.com', telefon: '0555 234 5678', kayitTarihi: '15 Şubat 2023', sonGiris: '14 Mayıs 2023, 09:15', durum: 'Aktif', siparisler: 8 },
    { id: '1003', ad: 'Mehmet Kaya', email: 'mehmet@yahoo.com', telefon: '0556 345 6789', kayitTarihi: '20 Mart 2023', sonGiris: '10 Mayıs 2023, 16:45', durum: 'Pasif', siparisler: 0 },
    { id: '1004', ad: 'Zeynep Şahin', email: 'zeynep@gmail.com', telefon: '0557 456 7890', kayitTarihi: '25 Nisan 2023', sonGiris: '12 Mayıs 2023, 11:30', durum: 'Aktif', siparisler: 5 },
    { id: '1005', ad: 'Mustafa Öztürk', email: 'mustafa@hotmail.com', telefon: '0558 567 8901', kayitTarihi: '30 Mayıs 2023', sonGiris: '15 Mayıs 2023, 08:45', durum: 'Aktif', siparisler: 3 },
    { id: '1006', ad: 'Fatma Çelik', email: 'fatma@yahoo.com', telefon: '0559 678 9012', kayitTarihi: '5 Haziran 2023', sonGiris: '11 Mayıs 2023, 10:20', durum: 'Pasif', siparisler: 0 },
    { id: '1007', ad: 'Ahmet Yıldız', email: 'ahmet@gmail.com', telefon: '0550 789 0123', kayitTarihi: '10 Temmuz 2023', sonGiris: '13 Mayıs 2023, 13:10', durum: 'Aktif', siparisler: 7 },
    { id: '1008', ad: 'Elif Korkmaz', email: 'elif@hotmail.com', telefon: '0551 890 1234', kayitTarihi: '15 Ağustos 2023', sonGiris: '14 Mayıs 2023, 17:25', durum: 'Aktif', siparisler: 4 },
  ]);

  // Filtreleme işlemi
  const filteredUyeler = uyeler.filter(uye => {
    // Durum filtresi
    if (filter !== 'tumu' && filter !== uye.durum.toLowerCase()) {
      return false;
    }
    
    // Arama filtresi
    if (searchQuery && !uye.ad.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !uye.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !uye.telefon.includes(searchQuery) &&
        !uye.id.includes(searchQuery)) {
      return false;
    }
    
    return true;
  });

  // Sayfalama ayarları
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUyeler.length / itemsPerPage);
  const displayedUyeler = filteredUyeler.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Üye verilerini yenile
  const refreshUyeler = () => {
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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="yonetici-page-title">Üyeler</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshUyeler}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Üye</p>
            <p className="text-2xl font-bold text-gray-800">{uyeler.length}</p>
          </div>
        </div>
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Aktif Üye</p>
            <p className="text-2xl font-bold text-gray-800">
              {uyeler.filter(u => u.durum === 'Aktif').length}
            </p>
          </div>
        </div>
        <div className="yonetici-card p-6 flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <ShieldX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pasif Üye</p>
            <p className="text-2xl font-bold text-gray-800">
              {uyeler.filter(u => u.durum === 'Pasif').length}
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
            placeholder="Arama yap (Ad, email, telefon, ID)"
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
              <ShieldCheck className="w-4 h-4" />
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
              <ShieldX className="w-4 h-4" />
              <span>Pasif</span>
            </div>
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Üyeler Tablosu */}
      <div className="yonetici-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Giriş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siparişler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUyeler.map((uye) => (
                <tr key={uye.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">#{uye.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{uye.ad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{uye.email}</div>
                    <div>{uye.telefon}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{uye.kayitTarihi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{uye.sonGiris}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{uye.siparisler}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(uye.durum)}`}>
                      {uye.durum}
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
              {displayedUyeler.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span>Yükleniyor...</span>
                      </div>
                    ) : (
                      <div>
                        <User className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p>Uygun üye bulunamadı</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {filteredUyeler.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Toplam {filteredUyeler.length} üyeden {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUyeler.length)} arası gösteriliyor
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