'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Eye, 
  Printer, 
  RotateCcw,
  CheckCircle2,
  Truck,
  ShoppingBag,
  XCircle,
  Search
} from 'lucide-react';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface SiparisData {
  id: number;
  created_at: string;
  user_id: string;
  magaza_id: number;
  durum: string;
  genel_toplam: number;
  user: {
    first_name: string;
    last_name: string;
  };
  sellers: {
    isim: string;
  };
}

export default function SiparislerPage() {
  const [siparisler, setSiparisler] = useState<SiparisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedSiparis, setSelectedSiparis] = useState<SiparisData | null>(null);

  useEffect(() => {
    fetchSiparisler();
  }, []);

  const fetchSiparisler = async () => {
    try {
      const { data: siparisData, error } = await supabase
        .from('siparis')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name
          ),
          sellers:magaza_id (
            isim
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSiparisler(siparisData as SiparisData[]);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDurumGuncelle = async (siparisId: number, yeniDurum: string) => {
    try {
      const { error } = await supabase
        .from('siparis')
        .update({ durum: yeniDurum })
        .eq('id', siparisId);

      if (error) throw error;

      // Siparişleri yeniden yükle
      fetchSiparisler();
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
    }
  };

  const handleYazdir = (siparis: SiparisData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sipariş #${siparis.id}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; margin-bottom: 10px; }
              .detail-row { margin-bottom: 5px; }
              .total { font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Sipariş Detayı</h1>
              <p>Sipariş No: ${siparis.id}</p>
              <p>Tarih: ${new Date(siparis.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="section">
              <div class="section-title">Müşteri Bilgileri</div>
              <div class="detail-row">Ad Soyad: ${siparis.user.first_name} ${siparis.user.last_name}</div>
            </div>
            <div class="section">
              <div class="section-title">Bayi Bilgileri</div>
              <div class="detail-row">Bayi: ${siparis.sellers.isim}</div>
            </div>
            <div class="section">
              <div class="section-title">Sipariş Bilgileri</div>
              <div class="detail-row">Durum: ${siparis.durum}</div>
              <div class="detail-row">Toplam Tutar: ${siparis.genel_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredSiparisler = siparisler.filter(siparis => {
    const searchMatch = 
      (siparis.id?.toString() || '').includes(searchTerm.toLowerCase()) ||
      ((siparis.user?.first_name + ' ' + siparis.user?.last_name)?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus ? siparis.durum === filterStatus : true;
    
    return searchMatch && statusMatch;
  });

  const durumRenkleri: { [key: string]: string } = {
    'siparis_alindi': 'bg-blue-100 text-blue-800',
    'siparis_onaylandi': 'bg-yellow-100 text-yellow-800',
    'siparis_hazirlaniyor': 'bg-purple-100 text-purple-800',
    'kargoya_verildi': 'bg-indigo-100 text-indigo-800',
    'siparis_tamamlandi': 'bg-green-100 text-green-800',
    'siparis_iptal': 'bg-red-100 text-red-800'
  };

  const durumMetinleri: { [key: string]: string } = {
    'siparis_alindi': 'Sipariş Alındı',
    'siparis_onaylandi': 'Onaylandı',
    'siparis_hazirlaniyor': 'Hazırlanıyor',
    'kargoya_verildi': 'Kargoya Verildi',
    'siparis_tamamlandi': 'Tamamlandı',
    'siparis_iptal': 'İptal Edildi'
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Arama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Sipariş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-full sm:w-64 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors cursor-pointer"
          >
            <option value="">Tüm Durumlar</option>
            <option value="siparis_alindi">Sipariş Alındı</option>
            <option value="siparis_onaylandi">Onaylandı</option>
            <option value="siparis_hazirlaniyor">Hazırlanıyor</option>
            <option value="kargoya_verildi">Kargoya Verildi</option>
            <option value="siparis_tamamlandi">Tamamlandı</option>
            <option value="siparis_iptal">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Siparişler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Sipariş No</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Müşteri</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Bayi</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Tarih</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Tutar</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Durum</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredSiparisler.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-700">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                filteredSiparisler.map((siparis) => (
                  <tr key={siparis.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-900">#{siparis.id}</td>
                    <td className="py-4 px-6 text-gray-900">{siparis.user.first_name} {siparis.user.last_name}</td>
                    <td className="py-4 px-6 text-gray-900">{siparis.sellers.isim}</td>
                    <td className="py-4 px-6 text-gray-700">
                      {new Date(siparis.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{siparis.genel_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${durumRenkleri[siparis.durum]}`}>
                        {durumMetinleri[siparis.durum]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setSelectedSiparis(siparis)}
                          className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleYazdir(siparis)}
                          className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        
                        {siparis.durum === 'siparis_iptal' ? (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_alindi')}
                            className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            title="Siparişi Geri Al"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            {siparis.durum === 'siparis_alindi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_onaylandi')}
                                className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Siparişi Onayla"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_onaylandi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_hazirlaniyor')}
                                className="p-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                title="Hazırlanıyor"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_hazirlaniyor' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'kargoya_verildi')}
                                className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                title="Kargoya Ver"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'kargoya_verildi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_tamamlandi')}
                                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Siparişi Tamamla"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum !== 'siparis_tamamlandi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_iptal')}
                                className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Siparişi İptal Et"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 