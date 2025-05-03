'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ShoppingBag,
  Truck,
  DollarSign,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';
import Link from 'next/link';

type SiparisDurumu = 'Beklemede' | 'Hazırlanıyor' | 'Kargoya Verildi' | 'Tamamlandı' | 'İptal Edildi';

interface Siparis {
  id: string;
  musteriAdi: string;
  tarih: string;
  tutar: number;
  durumu: SiparisDurumu;
  odemeYontemi: string;
  urunler: {
    id: number;
    ad: string;
    adet: number;
    fiyat: number;
  }[];
}

export default function SiparislerSayfasi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatus, setFiltreStatus] = useState<string>('Tümü');
  
  // Örnek siparişler
  const [siparisler, setSiparisler] = useState<Siparis[]>([
    {
      id: 'SIP-1001',
      musteriAdi: 'Ahmet Yılmaz',
      tarih: '15.05.2023',
      tutar: 3200,
      durumu: 'Tamamlandı',
      odemeYontemi: 'Kredi Kartı',
      urunler: [
        { id: 1, ad: 'Michelin Primacy 4 205/55 R16', adet: 2, fiyat: 1600 }
      ]
    },
    {
      id: 'SIP-1002',
      musteriAdi: 'Mehmet Kaya',
      tarih: '16.05.2023',
      tutar: 4800,
      durumu: 'Hazırlanıyor',
      odemeYontemi: 'Havale/EFT',
      urunler: [
        { id: 2, ad: 'Bridgestone Turanza T005 225/45 R17', adet: 3, fiyat: 1600 }
      ]
    },
    {
      id: 'SIP-1003',
      musteriAdi: 'Ayşe Demir',
      tarih: '17.05.2023',
      tutar: 2400,
      durumu: 'Beklemede',
      odemeYontemi: 'Kapıda Ödeme',
      urunler: [
        { id: 3, ad: 'Continental WinterContact TS 870 195/65 R15', adet: 1, fiyat: 2400 }
      ]
    },
    {
      id: 'SIP-1004',
      musteriAdi: 'Fatma Şahin',
      tarih: '15.05.2023',
      tutar: 9600,
      durumu: 'Kargoya Verildi',
      odemeYontemi: 'Kredi Kartı',
      urunler: [
        { id: 4, ad: 'Goodyear EfficientGrip Performance 2 215/55 R17', adet: 4, fiyat: 2400 }
      ]
    },
    {
      id: 'SIP-1005',
      musteriAdi: 'Mustafa Özkan',
      tarih: '14.05.2023',
      tutar: 6200,
      durumu: 'İptal Edildi',
      odemeYontemi: 'Havale/EFT',
      urunler: [
        { id: 5, ad: 'Pirelli Cinturato P7 225/50 R17', adet: 2, fiyat: 3100 }
      ]
    },
    {
      id: 'SIP-1006',
      musteriAdi: 'Zeynep Aktaş',
      tarih: '13.05.2023',
      tutar: 5600,
      durumu: 'Tamamlandı',
      odemeYontemi: 'Kredi Kartı',
      urunler: [
        { id: 6, ad: 'Michelin CrossClimate 2 215/60 R16', adet: 2, fiyat: 2800 }
      ]
    },
  ]);

  // İstatistikler
  const bekleyenSiparisler = siparisler.filter(s => s.durumu === 'Beklemede').length;
  const hazirlananSiparisler = siparisler.filter(s => s.durumu === 'Hazırlanıyor').length;
  const kargodakiSiparisler = siparisler.filter(s => s.durumu === 'Kargoya Verildi').length;
  const tamamlananSiparisler = siparisler.filter(s => s.durumu === 'Tamamlandı').length;

  // Filtreleme
  const filteredSiparisler = siparisler.filter(siparis => {
    const searchMatch = 
      siparis.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      siparis.musteriAdi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filtreStatus === 'Tümü' || siparis.durumu === filtreStatus;
    
    return searchMatch && statusMatch;
  });
  
  // Durum değiştirme fonksiyonu
  const handleDurumDegistir = useCallback((siparisId: string, yeniDurum: SiparisDurumu) => {
    try {
      // Önce DOM'u güncelle ve animasyon ekleyerek daha yumuşak bir geçiş sağla
      const statusBadge = document.querySelector(`#siparis-${siparisId} .status-badge`);
      if (statusBadge) {
        statusBadge.classList.add('opacity-50');
      }

      // Sonra state'i güvenli şekilde güncelle
      setTimeout(() => {
        setSiparisler(prev => prev.map(siparis => 
          siparis.id === siparisId ? { ...siparis, durumu: yeniDurum } : siparis
        ));
      }, 50);
    } catch (err) {
      console.error("Sipariş durumu değiştirme hatası:", err);
    }
  }, []);

  // Durum badge renkleri - memorize edilmiş fonksiyon
  const getDurumBadgeClass = useCallback((durum: SiparisDurumu) => {
    switch (durum) {
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hazırlanıyor':
        return 'bg-blue-100 text-blue-700';
      case 'Kargoya Verildi':
        return 'bg-indigo-100 text-indigo-700';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-700';
      case 'İptal Edildi':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Başlık ve Üst Bölüm */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Sipariş No veya Müşteri Adı Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filtreStatus}
            onChange={(e) => setFiltreStatus(e.target.value)}
          >
            <option value="Tümü">Tüm Durumlar</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Kargoya Verildi">Kargoya Verildi</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="İptal Edildi">İptal Edildi</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 text-gray-500" />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Bekleyen */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xl font-bold text-yellow-600">{bekleyenSiparisler}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Bekleyen Siparişler</h3>
        </div>

        {/* Hazırlanıyor */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-blue-600">{hazirlananSiparisler}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Hazırlanan Siparişler</h3>
        </div>

        {/* Kargoda */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <Truck className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-indigo-600">{kargodakiSiparisler}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Kargodaki Siparişler</h3>
        </div>

        {/* Tamamlanan */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xl font-bold text-green-600">{tamamlananSiparisler}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Tamamlanan Siparişler</h3>
        </div>
      </div>

      {/* Siparişler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Yöntemi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durumu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSiparisler.map((siparis) => (
                <tr key={siparis.id} id={`siparis-${siparis.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {siparis.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {siparis.musteriAdi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {siparis.tarih}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {siparis.tutar.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {siparis.odemeYontemi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge inline-flex px-2 py-1 text-xs rounded-full font-medium ${getDurumBadgeClass(siparis.durumu)}`}>
                      {siparis.durumu}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      {siparis.durumu === 'Beklemede' && (
                        <button 
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          onClick={() => handleDurumDegistir(siparis.id, 'Hazırlanıyor')}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      )}
                      
                      {siparis.durumu === 'Hazırlanıyor' && (
                        <button 
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                          onClick={() => handleDurumDegistir(siparis.id, 'Kargoya Verildi')}
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                      
                      {siparis.durumu === 'Kargoya Verildi' && (
                        <button 
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          onClick={() => handleDurumDegistir(siparis.id, 'Tamamlandı')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {(siparis.durumu === 'Beklemede' || siparis.durumu === 'Hazırlanıyor') && (
                        <button 
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          onClick={() => handleDurumDegistir(siparis.id, 'İptal Edildi')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablo Altı */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam <span className="font-medium">{filteredSiparisler.length}</span> sipariş gösteriliyor
          </div>
          
          <Link 
            href="/bayi/siparisler/rapor" 
            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium"
          >
            Sipariş Raporu
          </Link>
        </div>
      </div>
    </div>
  );
} 