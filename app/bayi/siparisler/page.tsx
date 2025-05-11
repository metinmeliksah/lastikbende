'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useBayi } from '../../contexts/BayiContext';
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
  Printer,
  RotateCcw,
  Store,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface SiparisData {
  id: number;
  user_id: string;
  fatura_adres_id: number;
  teslimat_adres_id: number;
  montaj_bayi_id: number | null;
  montaj_tarihi: string | null;
  montaj_saati: string | null;
  montaj_notu: string | null;
  toplam_tutar: number;
  kargo_tutari: number;
  durum: string;
  teslimat_tipi: string;
  created_at: string;
  updated_at: string;
  magaza_id: number;
  montaj_bilgisi: any;
  odeme_bilgisi: any;
  siparis_durumu: string;
  siparis_tarihi: string;
  guncelleme_tarihi: string;
  kargo_takip_no: string | null;
  kargo_firmasi: string | null;
  kargo_ucreti: number;
  genel_toplam: number;
  siparis_no: string;
  // İlişkili tablo verileri
  fatura_adres: {
    adres_baslik: string;
    adres: string;
    sehir: string;
    ilce: string;
    telefon: string;
    adres_tipi: string;
  };
  teslimat_adres: {
    adres_baslik: string;
    adres: string;
    sehir: string;
    ilce: string;
    telefon: string;
    adres_tipi: string;
  };
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function SiparislerPage() {
  const { bayiData, loading: bayiLoading } = useBayi();
  const [siparisler, setSiparisler] = useState<SiparisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [detayModal, setDetayModal] = useState(false);
  const [secilenSiparis, setSecilenSiparis] = useState<SiparisData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatus, setFiltreStatus] = useState<string>('Tümü');

  useEffect(() => {
    if (!bayiLoading && bayiData?.bayi_id) {
      fetchSiparisler(bayiData.bayi_id);
    }
  }, [bayiLoading, bayiData]);

  const fetchSiparisler = async (bayiId: number) => {
    try {
      const { data: siparisData, error } = await supabase
        .from('siparis')
        .select(`
          *,
          fatura_adres:adres!fatura_adres_id (
            adres_baslik,
            adres,
            sehir,
            ilce,
            telefon,
            adres_tipi
          ),
          teslimat_adres:adres!teslimat_adres_id (
            adres_baslik,
            adres,
            sehir,
            ilce,
            telefon,
            adres_tipi
          ),
          user:profiles!user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('magaza_id', bayiId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSiparisler(siparisData || []);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetayGor = (siparis: SiparisData) => {
    setSecilenSiparis(siparis);
    setDetayModal(true);
  };

  const formatTarih = (tarih: string) => {
    return new Date(tarih).toLocaleString('tr-TR');
  };

  const formatParaBirimi = (tutar: number) => {
    return tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
  };

  // İstatistikler
  const bekleyenSiparisler = siparisler.filter(s => s.durum === 'siparis_alindi').length;
  const hazirlananSiparisler = siparisler.filter(s => s.durum === 'siparis_onaylandi').length;
  const kargodakiSiparisler = siparisler.filter(s => s.durum === 'siparis_kargoda').length;
  const tamamlananSiparisler = siparisler.filter(s => s.durum === 'siparis_tamamlandi').length;

  // Filtreleme
  const filteredSiparisler = siparisler.filter(siparis => {
    const searchMatch = 
      (siparis.id?.toString() || '').includes(searchTerm.toLowerCase()) || 
      `${siparis.user?.first_name || ''} ${siparis.user?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filtreStatus === 'Tümü' || siparis.durum === filtreStatus;
    
    return searchMatch && statusMatch;
  });

  // Durum badge renkleri ve metinleri
  const getDurumBadgeClass = useCallback((durum: string) => {
    switch (durum) {
      case 'siparis_alindi':
        return 'bg-yellow-100 text-yellow-700';
      case 'siparis_onaylandi':
        return 'bg-blue-100 text-blue-700';
      case 'siparis_kargoda':
        return 'bg-indigo-100 text-indigo-700';
      case 'siparis_teslimatta':
        return 'bg-purple-100 text-purple-700';
      case 'siparis_tamamlandi':
        return 'bg-green-100 text-green-700';
      case 'siparis_iptal':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const getDurumText = useCallback((durum: string) => {
    switch (durum) {
      case 'siparis_alindi':
        return 'Sipariş Alındı';
      case 'siparis_onaylandi':
        return 'Onaylandı';
      case 'siparis_kargoda':
        return 'Kargoda';
      case 'siparis_teslimatta':
        return 'Teslimatta';
      case 'siparis_tamamlandi':
        return 'Tamamlandı';
      case 'siparis_iptal':
        return 'İptal Edildi';
      default:
        return durum;
    }
  }, []);

  // Sipariş durumu güncelleme fonksiyonu
  const handleDurumGuncelle = async (siparisId: number, yeniDurum: string) => {
    try {
      const { error } = await supabase
        .from('siparis')
        .update({ durum: yeniDurum })
        .eq('id', siparisId);

      if (error) throw error;

      // Siparişleri yeniden yükle
      fetchSiparisler(bayiData?.bayi_id || 0);
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
    }
  };

  // Yazdırma fonksiyonu ekle
  const handleYazdir = (siparis: SiparisData) => {
    const yazdirilacakIcerik = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center;">Sipariş Özeti</h2>
        <hr style="margin: 20px 0;" />
        
        <div style="margin-bottom: 20px;">
          <h3>Sipariş Bilgileri</h3>
          <p><strong>Sipariş No:</strong> #${siparis.id}</p>
          <p><strong>Tarih:</strong> ${formatTarih(siparis.created_at)}</p>
          <p><strong>Durum:</strong> ${getDurumText(siparis.durum)}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Müşteri Bilgileri</h3>
          <p><strong>Ad Soyad:</strong> ${siparis.user.first_name} ${siparis.user.last_name}</p>
          <p><strong>Telefon:</strong> ${siparis.user.phone}</p>
          <p><strong>E-posta:</strong> ${siparis.user.email}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Teslimat Adresi</h3>
          <p>${siparis.teslimat_adres.adres_baslik}</p>
          <p>${siparis.teslimat_adres.adres}</p>
          <p>${siparis.teslimat_adres.ilce} / ${siparis.teslimat_adres.sehir}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Fatura Adresi</h3>
          <p>${siparis.fatura_adres.adres_baslik}</p>
          <p>${siparis.fatura_adres.adres}</p>
          <p>${siparis.fatura_adres.ilce} / ${siparis.fatura_adres.sehir}</p>
        </div>

        ${siparis.montaj_bayi_id ? `
          <div style="margin-bottom: 20px;">
            <h3>Montaj Bilgileri</h3>
            <p><strong>Montaj Tarihi:</strong> ${siparis.montaj_tarihi}</p>
            <p><strong>Montaj Saati:</strong> ${siparis.montaj_saati}</p>
            ${siparis.montaj_notu ? `<p><strong>Montaj Notu:</strong> ${siparis.montaj_notu}</p>` : ''}
          </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <h3>Ödeme Bilgileri</h3>
          <p><strong>Toplam Tutar:</strong> ${formatParaBirimi(siparis.toplam_tutar)}</p>
          <p><strong>Kargo Tutarı:</strong> ${formatParaBirimi(siparis.kargo_tutari)}</p>
          <p><strong>Genel Toplam:</strong> ${formatParaBirimi(siparis.genel_toplam)}</p>
        </div>
      </div>
    `;

    const yazdir = window.open('', '_blank');
    if (yazdir) {
      yazdir.document.write(yazdirilacakIcerik);
      yazdir.document.close();
      yazdir.print();
    }
  };

  // Toplu yazdırma fonksiyonu ekle
  const handleTopluYazdir = () => {
    const yazdirilacakIcerik = `
      <html>
        <head>
          <title>Siparişler Raporu</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .siparis { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; break-inside: avoid; }
            .siparis h3 { margin: 0 0 10px 0; color: #333; }
            .bilgi-grubu { margin-bottom: 15px; }
            .bilgi-grubu h4 { margin: 0 0 5px 0; color: #666; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            @media print {
              .siparis { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">Siparişler Raporu</h1>
          ${filteredSiparisler.map(siparis => `
            <div class="siparis">
              <h3>Sipariş #${siparis.id}</h3>
              
              <div class="bilgi-grubu">
                <h4>Sipariş Bilgileri</h4>
                <div class="grid">
                  <div>Tarih: ${formatTarih(siparis.created_at)}</div>
                  <div>Durum: ${getDurumText(siparis.durum)}</div>
                </div>
              </div>

              <div class="bilgi-grubu">
                <h4>Müşteri Bilgileri</h4>
                <div class="grid">
                  <div>Ad Soyad: ${siparis.user.first_name} ${siparis.user.last_name}</div>
                  <div>Telefon: ${siparis.user.phone}</div>
                  <div>E-posta: ${siparis.user.email}</div>
                </div>
              </div>

              <div class="bilgi-grubu">
                <h4>Teslimat Bilgileri</h4>
                <div class="grid">
                  <div>
                    <strong>Teslimat Adresi:</strong><br>
                    ${siparis.teslimat_adres.adres_baslik}<br>
                    ${siparis.teslimat_adres.adres}<br>
                    ${siparis.teslimat_adres.ilce} / ${siparis.teslimat_adres.sehir}
                  </div>
                  <div>
                    <strong>Fatura Adresi:</strong><br>
                    ${siparis.fatura_adres.adres_baslik}<br>
                    ${siparis.fatura_adres.adres}<br>
                    ${siparis.fatura_adres.ilce} / ${siparis.fatura_adres.sehir}
                  </div>
                </div>
              </div>

              ${siparis.montaj_bayi_id ? `
                <div class="bilgi-grubu">
                  <h4>Montaj Bilgileri</h4>
                  <div class="grid">
                    <div>Montaj Tarihi: ${siparis.montaj_tarihi}</div>
                    <div>Montaj Saati: ${siparis.montaj_saati}</div>
                    ${siparis.montaj_notu ? `<div>Montaj Notu: ${siparis.montaj_notu}</div>` : ''}
                  </div>
                </div>
              ` : ''}

              ${siparis.kargo_firmasi ? `
                <div class="bilgi-grubu">
                  <h4>Kargo Bilgileri</h4>
                  <div class="grid">
                    <div>Kargo Firması: ${siparis.kargo_firmasi}</div>
                    <div>Takip No: ${siparis.kargo_takip_no || '-'}</div>
                    <div>Kargo Ücreti: ${formatParaBirimi(siparis.kargo_ucreti)}</div>
                  </div>
                </div>
              ` : ''}

              <div class="bilgi-grubu">
                <h4>Ödeme Bilgileri</h4>
                <div class="grid">
                  <div>Toplam Tutar: ${formatParaBirimi(siparis.toplam_tutar)}</div>
                  <div>Kargo Tutarı: ${formatParaBirimi(siparis.kargo_tutari)}</div>
                  <div>Genel Toplam: ${formatParaBirimi(siparis.genel_toplam)}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const yazdir = window.open('', '_blank');
    if (yazdir) {
      yazdir.document.write(yazdirilacakIcerik);
      yazdir.document.close();
      yazdir.print();
    }
  };

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
            <option value="siparis_alindi">Sipariş Alındı</option>
            <option value="siparis_onaylandi">Onaylandı</option>
            <option value="siparis_kargoda">Kargoda</option>
            <option value="siparis_teslimatta">Teslimatta</option>
            <option value="siparis_tamamlandi">Tamamlandı</option>
            <option value="siparis_iptal">İptal Edildi</option>
          </select>
          
          <button 
            onClick={handleTopluYazdir}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
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
                  Durumu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredSiparisler.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSiparisler.map((siparis) => (
                  <tr key={siparis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      #{siparis.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {siparis.user.first_name} {siparis.user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTarih(siparis.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatParaBirimi(siparis.genel_toplam)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getDurumBadgeClass(siparis.durum)}`}>
                        {getDurumText(siparis.durum)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleDetayGor(siparis)}
                          className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                          title="Detay Gör"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleYazdir(siparis)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          title="Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Durum güncelleme butonları */}
                        {siparis.durum === 'siparis_alindi' && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_onaylandi')}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            title="Siparişi Onayla"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum === 'siparis_onaylandi' && !siparis.montaj_bayi_id && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_kargoda')}
                            className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                            title="Kargoya Ver"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum === 'siparis_onaylandi' && siparis.montaj_bayi_id && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_teslimatta')}
                            className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                            title="Mağazada Teslime Hazır"
                          >
                            <Store className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum === 'siparis_kargoda' && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_tamamlandi')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                            title="Siparişi Tamamla"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum === 'siparis_teslimatta' && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_tamamlandi')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                            title="Siparişi Tamamla"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum !== 'siparis_iptal' && siparis.durum !== 'siparis_tamamlandi' && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_iptal')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            title="Siparişi İptal Et"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {siparis.durum === 'siparis_iptal' && (
                          <button
                            onClick={() => handleDurumGuncelle(siparis.id, 'siparis_alindi')}
                            className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                            title="Siparişi Geri Al"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tablo Altı */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam <span className="font-medium">{filteredSiparisler.length}</span> sipariş gösteriliyor
          </div>
        </div>
      </div>

      {/* Detay Modal */}
      {detayModal && secilenSiparis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Sipariş Detayı</h2>
              <button
                onClick={() => setDetayModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Sipariş Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sipariş Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sipariş No</p>
                    <p className="font-medium">#{secilenSiparis.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sipariş Durumu</p>
                    <p className="font-medium">{getDurumText(secilenSiparis.durum)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                    <p className="font-medium">{formatTarih(secilenSiparis.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Son Güncelleme</p>
                    <p className="font-medium">{formatTarih(secilenSiparis.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ad Soyad</p>
                    <p className="font-medium">{secilenSiparis.user.first_name} {secilenSiparis.user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-posta</p>
                    <p className="font-medium">{secilenSiparis.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium">{secilenSiparis.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Teslimat Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Teslimat Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Teslimat Adresi</p>
                    <p className="font-medium">{secilenSiparis.teslimat_adres.adres_baslik}</p>
                    <p className="text-sm text-gray-600 mt-1">{secilenSiparis.teslimat_adres.adres}</p>
                    <p className="text-sm text-gray-600">{secilenSiparis.teslimat_adres.ilce} / {secilenSiparis.teslimat_adres.sehir}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fatura Adresi</p>
                    <p className="font-medium">{secilenSiparis.fatura_adres.adres_baslik}</p>
                    <p className="text-sm text-gray-600 mt-1">{secilenSiparis.fatura_adres.adres}</p>
                    <p className="text-sm text-gray-600">{secilenSiparis.fatura_adres.ilce} / {secilenSiparis.fatura_adres.sehir}</p>
                  </div>
                </div>
              </div>

              {/* Montaj Bilgileri */}
              {secilenSiparis.montaj_bayi_id && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Montaj Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Montaj Tarihi</p>
                      <p className="font-medium">{secilenSiparis.montaj_tarihi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montaj Saati</p>
                      <p className="font-medium">{secilenSiparis.montaj_saati}</p>
                    </div>
                    {secilenSiparis.montaj_notu && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Montaj Notu</p>
                        <p className="font-medium">{secilenSiparis.montaj_notu}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kargo Bilgileri */}
              {secilenSiparis.kargo_firmasi && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Kargo Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Kargo Firması</p>
                      <p className="font-medium">{secilenSiparis.kargo_firmasi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Takip No</p>
                      <p className="font-medium">{secilenSiparis.kargo_takip_no || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kargo Ücreti</p>
                      <p className="font-medium">{formatParaBirimi(secilenSiparis.kargo_ucreti)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ödeme Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Ödeme Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="font-medium">{formatParaBirimi(secilenSiparis.toplam_tutar)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kargo Tutarı</p>
                    <p className="font-medium">{formatParaBirimi(secilenSiparis.kargo_tutari)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Genel Toplam</p>
                    <p className="font-medium text-lg text-purple-600">{formatParaBirimi(secilenSiparis.genel_toplam)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetayModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 