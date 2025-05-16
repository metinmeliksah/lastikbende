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
  Search,
  Store
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
  montaj_bayi_id: number | null;
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSiparisForStatus, setSelectedSiparisForStatus] = useState<number | null>(null);

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
      // Kargoya verildi durumunu siparis_teslimatta olarak güncelle
      const guncellenenDurum = yeniDurum === 'kargoya_verildi' ? 'siparis_teslimatta' : yeniDurum;
      
      const { error } = await supabase
        .from('siparis')
        .update({ durum: guncellenenDurum })
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

  const handleGeriAl = (siparisId: number) => {
    setSelectedSiparisForStatus(siparisId);
    setShowStatusModal(true);
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
    'siparis_teslimatta': 'bg-indigo-100 text-indigo-800',
    'siparis_tamamlandi': 'bg-green-100 text-green-800',
    'siparis_iptal': 'bg-red-100 text-red-800'
  };

  const durumMetinleri: { [key: string]: string | ((siparis: SiparisData) => string) } = {
    'siparis_alindi': 'Sipariş Alındı',
    'siparis_onaylandi': 'Onaylandı',
    'siparis_hazirlaniyor': 'Hazırlanıyor',
    'siparis_teslimatta': (siparis: SiparisData) => 
      siparis.montaj_bayi_id === null ? 'Sipariş Kargoda' : 'Montaja Hazır',
    'siparis_tamamlandi': 'Tamamlandı',
    'siparis_iptal': 'İptal Edildi'
  };

  const getDurumMetni = (siparis: SiparisData): string => {
    const durumMetni = durumMetinleri[siparis.durum];
    return typeof durumMetni === 'function' ? durumMetni(siparis) : durumMetni;
  };

  // Sipariş sayılarını hesapla
  const bekleyenSiparisler = siparisler.filter(s => s.durum === 'siparis_alindi' || s.durum === 'siparis_onaylandi').length;
  const hazirlananSiparisler = siparisler.filter(s => s.durum === 'siparis_hazirlaniyor').length;
  const kargodakiSiparisler = siparisler.filter(s => s.durum === 'siparis_teslimatta').length;
  const tamamlananSiparisler = siparisler.filter(s => s.durum === 'siparis_tamamlandi').length;

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
              <h3 className="text-sm font-medium text-gray-500">Bekleyen Siparişler</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{bekleyenSiparisler}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
          </div>
          <div>
              <h3 className="text-sm font-medium text-gray-500">Hazırlanan Siparişler</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{hazirlananSiparisler}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Truck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
              <h3 className="text-sm font-medium text-gray-500">Teslim Aşamasındaki Siparişler</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{kargodakiSiparisler}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
              <h3 className="text-sm font-medium text-gray-500">Tamamlanan Siparişler</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{tamamlananSiparisler}</p>
            </div>
          </div>
        </div>
      </div>

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
            <option value="siparis_teslimatta">Teslimatta</option>
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
                        {getDurumMetni(siparis)}
                    </span>
                  </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setSelectedSiparis(siparis)}
                          className="p-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Detay"
                        >
                        <Eye className="w-4 h-4" />
                      </button>
                        <button
                          onClick={() => handleYazdir(siparis)}
                          className="p-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        
                        {siparis.durum === 'siparis_iptal' ? (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_alindi')}
                            className="p-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Siparişi Geri Al"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : siparis.durum === 'siparis_tamamlandi' ? (
                          <button
                            onClick={() => handleGeriAl(siparis.id)}
                            className="p-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Siparişi Geri Al"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            {siparis.durum === 'siparis_alindi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_onaylandi')}
                                className="p-1.5 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors"
                                title="Siparişi Onayla"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_onaylandi' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_hazirlaniyor')}
                                className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                title="Hazırlanıyor"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_hazirlaniyor' && !siparis.montaj_bayi_id && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_teslimatta')}
                                className="p-1.5 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                                title="Kargoya Ver"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_hazirlaniyor' && siparis.montaj_bayi_id && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_teslimatta')}
                                className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                title="Montaja Hazır"
                              >
                                <Store className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum === 'siparis_teslimatta' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_tamamlandi')}
                                className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Siparişi Tamamla"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {siparis.durum !== 'siparis_tamamlandi' && siparis.durum !== 'siparis_iptal' && (
                              <button
                                onClick={() => handleDurumGuncelle(siparis.id, 'siparis_iptal')}
                                className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
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

      {/* Durum Seçme Modalı */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Siparişi Geri Al</h2>
            <p className="text-sm text-gray-700 mb-4">Lütfen siparişin yeni durumunu seçin:</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleDurumGuncelle(selectedSiparisForStatus!, 'siparis_alindi');
                  setShowStatusModal(false);
                }}
                className="w-full p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sipariş Alındı
              </button>
              <button
                onClick={() => {
                  handleDurumGuncelle(selectedSiparisForStatus!, 'siparis_onaylandi');
                  setShowStatusModal(false);
                }}
                className="w-full p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sipariş Onaylandı
              </button>
                <button
                onClick={() => {
                  handleDurumGuncelle(selectedSiparisForStatus!, 'siparis_hazirlaniyor');
                  setShowStatusModal(false);
                }}
                className="w-full p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sipariş Hazırlanıyor
                </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
            </div>
          </div>
        )}
    </div>
  );
} 