'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getSupabaseClient } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Siparis {
  id: number;
  siparis_no: string;
  user_id: string;
  teslimat_tipi: 'adres' | 'magaza';
  durum: string;
  toplam_tutar: number;
  kargo_ucreti: number;
  genel_toplam: number;
  created_at: string;
  updated_at: string;
}

interface OrderListProps {
  refreshTrigger?: number;
}

export default function OrderList({ refreshTrigger }: OrderListProps) {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchSiparisler();
  }, [refreshTrigger]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Oturum bulunamadı. Lütfen giriş yapın.');
        return;
      }

      const { data: siparisData, error } = await supabase
        .from('siparis')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Sipariş verisi çekme hatası:', error);
        toast.error('Siparişler yüklenirken hata oluştu');
        return;
      }

      setSiparisler((siparisData as unknown as Siparis[]) || []);
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getDurumText = (durum: string) => {
    const durumMap: { [key: string]: string } = {
      'siparis_alindi': 'Sipariş Alındı',
      'siparis_onaylandi': 'Onaylandı',
      'siparis_hazirlaniyor': 'Hazırlanıyor',
      'siparis_teslimatta': 'Kargoda',
      'siparis_tamamlandi': 'Tamamlandı',
      'siparis_iptal': 'İptal Edildi'
    };
    return durumMap[durum] || durum;
  };

  const getDurumClass = (durum: string) => {
    const durumClasses: { [key: string]: string } = {
      'siparis_alindi': 'bg-blue-500/20 text-blue-400',
      'siparis_onaylandi': 'bg-green-500/20 text-green-400',
      'siparis_hazirlaniyor': 'bg-yellow-500/20 text-yellow-400',
      'siparis_teslimatta': 'bg-purple-500/20 text-purple-400',
      'siparis_tamamlandi': 'bg-green-500/20 text-green-400',
      'siparis_iptal': 'bg-red-500/20 text-red-400'
    };
    return durumClasses[durum] || 'bg-gray-500/20 text-gray-400';
  };

  // Arama filtresi
  const filteredSiparisler = siparisler.filter(siparis => 
    !searchTerm || 
    siparis.siparis_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    siparis.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-300">Siparişler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Kontroller */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-100">
          Siparişlerim ({filteredSiparisler.length})
        </h2>

        {/* Arama */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sipariş no veya ID ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-dark-400 border border-dark-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sipariş Listesi */}
      {filteredSiparisler.length === 0 ? (
        <div className="text-center py-12 bg-dark-300 rounded-lg border border-dark-100">
          <div className="text-gray-300 text-lg mb-2">
            {siparisler.length === 0 ? 'Henüz hiç siparişiniz yok' : 'Filtrelere uygun sipariş bulunamadı'}
          </div>
          <p className="text-gray-400">
            {siparisler.length === 0 ? 'İlk siparişinizi vermek için ürünleri incelemeye başlayabilirsiniz.' : 'Farklı arama terimleri deneyebilirsiniz.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSiparisler.map((siparis) => (
            <div key={siparis.id} className="bg-dark-300 border border-dark-100 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-6 cursor-pointer hover:bg-dark-200 transition-colors"
                onClick={() => toggleOrderDetails(siparis.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-100">
                      Sipariş #{siparis.siparis_no || siparis.id}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDurumClass(siparis.durum)}`}>
                      {getDurumText(siparis.durum)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Tarih: {formatDate(siparis.created_at)}</p>
                    <p>Toplam: <span className="text-primary font-medium">{formatPrice(siparis.genel_toplam)}</span></p>
                    <p>Teslimat: {siparis.teslimat_tipi === 'adres' ? 'Adrese Teslimat' : 'Mağazadan Teslim'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {expandedOrder === siparis.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedOrder === siparis.id && (
                <div className="border-t border-dark-100 bg-dark-400 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sipariş Bilgileri */}
                    <div>
                      <h4 className="font-medium text-gray-100 mb-3">Sipariş Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Sipariş No:</span> <span className="text-gray-200">{siparis.siparis_no || siparis.id}</span></p>
                        <p><span className="text-gray-400">Durum:</span> <span className="text-gray-200">{getDurumText(siparis.durum)}</span></p>
                        <p><span className="text-gray-400">Sipariş Tarihi:</span> <span className="text-gray-200">{formatDate(siparis.created_at)}</span></p>
                        <p><span className="text-gray-400">Son Güncelleme:</span> <span className="text-gray-200">{formatDate(siparis.updated_at)}</span></p>
                        <p><span className="text-gray-400">Teslimat Tipi:</span> <span className="text-gray-200">{siparis.teslimat_tipi === 'adres' ? 'Adrese Teslimat' : 'Mağazadan Teslim'}</span></p>
                      </div>
                    </div>

                    {/* Fiyat Bilgileri */}
                    <div>
                      <h4 className="font-medium text-gray-100 mb-3">Fiyat Detayları</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ürünler Toplamı:</span>
                          <span className="text-gray-200">{formatPrice(siparis.toplam_tutar)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kargo Ücreti:</span>
                          <span className="text-gray-200">{formatPrice(siparis.kargo_ucreti)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-lg border-t border-dark-100 pt-2">
                          <span className="text-gray-100">Genel Toplam:</span>
                          <span className="text-primary">{formatPrice(siparis.genel_toplam)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-gray-300">
                      💡 Sipariş detaylarını ve ürün bilgilerini görüntülemek için lütfen müşteri hizmetleri ile iletişime geçin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 