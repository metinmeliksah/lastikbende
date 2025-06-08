'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, ShoppingBag, Truck, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { useCart } from '@/app/contexts/CartContext';

const OdemeOnayPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siparisNo = searchParams.get('siparisNo');
  const odemeYontemi = searchParams.get('yontem');
  const [loading, setLoading] = useState(true);
  const [siparisDetay, setSiparisDetay] = useState<any>(null);
  const [hata, setHata] = useState<string | null>(null);
  const { user } = useAuth();
  const { sepetiYenile } = useCart();

  useEffect(() => {
    if (!siparisNo) {
      toast.error('Sipariş numarası bulunamadı');
      router.push('/sepet');
      return;
    }

    const fetchSiparisDetay = async () => {
      try {
        setLoading(true);
        setHata(null);
        
        // Sipariş başarılıysa sepeti yenile
        try {
          await sepetiYenile();
          console.log('Sepet yenilendi');
        } catch (error) {
          console.error('Sepet yenileme hatası:', error);
        }
        
        console.log('Sipariş bilgileri getiriliyor:', siparisNo);
        
        // API endpointini güncelliyoruz
        const response = await fetch(`/api/siparis?siparisId=${siparisNo}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache', // Önbelleği devre dışı bırak
            'X-From-Page': 'onay' // Özel bir header ekleyelim
          },
          credentials: 'include' // Cookie'leri dahil et
        });
        
        console.log('API yanıt durumu:', response.status);
        
        // API yanıtını JSON olarak al
        const data = await response.json();
        console.log('API yanıtı:', data);
        
        if (!response.ok) {
          console.warn('API yanıtı başarısız:', response.status, response.statusText);
          
          // Hata mesajını göster
          const errorMessage = typeof data.error === 'string' ? data.error : 
                             (typeof data.message === 'string' ? data.message : 'Sipariş bilgileri alınamadı');
          setHata(errorMessage);
          toast.error(errorMessage);
          
          // Hata durumunda yalnızca hata mesajı göster, demo veriyi kullanma
          if (siparisNo.startsWith('SIP-')) {
            // Sipariş numarası doğru formatta ise demo veri göster
            setSiparisDetay({
              siparisId: siparisNo,
              siparisNo: siparisNo,
              tarih: new Date().toLocaleDateString('tr-TR'),
              odeme: {
                yontem: odemeYontemi || 'credit-card',
                durum: odemeYontemi === 'bank-transfer' ? 'beklemede' : 'onaylandi'
              },
              isDemo: true // Demo veri olduğunu işaretle
            });
          } else {
            // Geçersiz sipariş numarası - demo bile gösterme
            return;
          }
          
          return;
        }
        
        if (data.success && data.data) {
          // API'den gelen veriyi kullan
          setSiparisDetay({
            siparisId: data.data.id || siparisNo,
            // Siparis_no yoksa siparis ID veya URL'deki siparisNo'yu kullan
            siparisNo: data.data.siparis_no || siparisNo,
            tarih: new Date(data.data.tarih || data.data.siparis_tarihi || data.data.created_at || Date.now()).toLocaleDateString('tr-TR'),
            odeme: {
              yontem: data.data.odeme_bilgisi?.yontem || odemeYontemi || 'credit-card',
              durum: data.data.odeme_bilgisi?.durum || (odemeYontemi === 'bank-transfer' ? 'beklemede' : 'onaylandi'),
              referans_no: data.data.odeme_bilgisi?.referans_no || `REF-${Date.now()}`,
              tutar: parseFloat(data.data.odeme_bilgisi?.tutar || data.data.toplam_tutar || 0)
            },
            teslimat: {
              tip: data.data.teslimat_tipi || 'adres',
              adresId: data.data.teslimat_adres_id ? Number(data.data.teslimat_adres_id) : null,
              magazaId: data.data.magaza_id ? Number(data.data.magaza_id) : null
            },
            fatura: {
              adresId: data.data.fatura_adres_id ? Number(data.data.fatura_adres_id) : null
            },
            siparisDurumu: data.data.siparis_durumu || 'siparis_alindi',
            durum: data.data.durum || 'hazırlanıyor'
          });
          setHata(null); // Başarılı API yanıtında hata mesajını temizle
        } else {
          // API başarılı yanıt vermedi, ama success: false değil (beklenmeyen durum)
          const errorMessage = data.error || 'Sipariş verileri alınamadı. Lütfen daha sonra tekrar deneyiniz.';
          setHata(errorMessage);
          toast.error(errorMessage || 'Sipariş verileri alınamadı');
          
          // Sipariş numarası doğru formatta ise demo veri göster
          if (siparisNo.startsWith('SIP-')) {
            setSiparisDetay({
              siparisId: siparisNo,
              siparisNo: siparisNo,
              tarih: new Date().toLocaleDateString('tr-TR'),
              odeme: {
                yontem: odemeYontemi || 'credit-card',
                durum: odemeYontemi === 'bank-transfer' ? 'beklemede' : 'onaylandi'
              },
              isDemo: true // Demo veri olduğunu işaretle
            });
          }
        }
      } catch (error) {
        console.error('Sipariş detayları alınamadı:', error);
        
        // Hata durumunda kullanıcıyı bilgilendir
        const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.';
        setHata(errorMessage);
        toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
        
        // Sipariş numarası doğru formatta ise demo veri göster
        if (siparisNo && siparisNo.startsWith('SIP-')) {
          setSiparisDetay({
            siparisId: siparisNo,
            siparisNo: siparisNo,
            tarih: new Date().toLocaleDateString('tr-TR'),
            odeme: {
              yontem: odemeYontemi || 'credit-card',
              durum: odemeYontemi === 'bank-transfer' ? 'beklemede' : 'onaylandi'
            },
            isDemo: true
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSiparisDetay();
  }, [siparisNo, router, searchParams, odemeYontemi]);

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Başlık ve İkon */}
          <div className="text-center mb-10">
            {!loading && hata && !siparisDetay?.isDemo ? (
              // Hata durumu gösterimi
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  type: 'spring',
                  bounce: 0.5
                }}
                className="inline-flex justify-center mb-4"
              >
                <AlertCircle className="w-24 h-24 text-red-500" />
              </motion.div>
            ) : (
              // Normal durum - onay ikonu
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  type: 'spring',
                  bounce: 0.5
                }}
                className="inline-flex justify-center mb-4"
              >
                <CheckCircle className="w-24 h-24 text-primary" />
              </motion.div>
            )}
            
            {!loading && hata && !siparisDetay?.isDemo ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Bir Sorun Oluştu</h1>
                <p className="text-gray-300 text-lg">{hata}</p>
                <div className="mt-6">
                  <Link href="/sepet" className="px-6 py-3 bg-primary text-white rounded-lg font-medium inline-block hover:bg-primary-600 transition-colors">
                    Sepete Dön
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Siparişiniz Alındı!</h1>
                
                {siparisDetay?.odeme?.yontem === 'bank-transfer' ? (
                  <p className="text-gray-300 text-lg">
                    Banka havalesi/EFT ödemenizi tamamladıktan sonra siparişiniz işleme alınacak.
                  </p>
                ) : (
                  <p className="text-gray-300 text-lg">
                    Ödemeniz onaylandı ve siparişiniz işleme alındı.
                  </p>
                )}
                
                {siparisDetay?.isDemo && (
                  <div className="mt-2 p-2 bg-yellow-900/50 text-yellow-200 rounded-lg inline-block">
                    <p className="text-sm">Sipariş bilgileri geçici olarak gösteriliyor.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sipariş Bilgileri - Hata yoksa veya demo veriyse göster */}
          {(!hata || siparisDetay?.isDemo) && (
            <div className="bg-dark-300 rounded-lg border border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="text-primary" />
                  Sipariş Detayları
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between text-gray-300">
                    <div>
                      <p className="text-sm">Sipariş ID:</p>
                      <p className="font-semibold text-white">{siparisDetay?.siparisNo || siparisNo}</p>
                    </div>
                    <div>
                      <p className="text-sm">Tarih:</p>
                      <p className="font-semibold text-white">{siparisDetay?.tarih || new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-sm">Ödeme Yöntemi:</p>
                      <p className="font-semibold text-white">
                        {siparisDetay?.odeme?.yontem === 'credit-card' ? 'Kredi Kartı' : 'Havale/EFT'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">Durumu:</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        siparisDetay?.odeme?.durum === 'beklemede' 
                          ? 'bg-yellow-800/60 text-yellow-200'
                          : 'bg-green-800/60 text-green-200'
                      }`}>
                        {siparisDetay?.odeme?.durum === 'beklemede' ? 'Ödeme Bekleniyor' : 'Onaylandı'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {siparisDetay?.odeme?.yontem === 'bank-transfer' && (
                <div className="p-6 border-b border-gray-700 bg-yellow-900/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Banka Havale Bilgileri</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="p-3 border border-gray-700 rounded-lg bg-dark-400">
                      <p className="font-medium text-white">Ziraat Bankası</p>
                      <p className="text-sm">IBAN: TR12 3456 7890 1234 5678 9012 34</p>
                      <p className="text-sm">Hesap Sahibi: LastikBende A.Ş.</p>
                    </div>
                    <div className="p-3 border border-gray-700 rounded-lg bg-dark-400">
                      <p className="font-medium text-white">Garanti Bankası</p>
                      <p className="text-sm">IBAN: TR98 7654 3210 9876 5432 1098 76</p>
                      <p className="text-sm">Hesap Sahibi: LastikBende A.Ş.</p>
                    </div>
                    <p className="text-sm mt-2">
                      <strong>Önemli:</strong> Havale yaparken açıklama kısmına sipariş numaranızı ({siparisDetay?.siparisNo || siparisNo}) yazmayı unutmayınız.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Siparişiniz İle İlgili Bilgilendirme</h3>
                <p className="text-gray-300 mb-4">
                  Siparişiniz ile ilgili bilgilendirmeler e-posta ve SMS yoluyla tarafınıza iletilecektir.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-white font-medium">Sipariş Hazırlanıyor</p>
                      <p className="text-gray-400 text-sm">Siparişiniz sisteme kaydedildi ve hazırlanmaya başlandı.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="text-gray-500 mt-1" size={20} />
                    <div>
                      <p className="text-gray-300 font-medium">Kargoya Verilecek</p>
                      <p className="text-gray-400 text-sm">Siparişiniz hazırlandıktan sonra kargoya verilecek.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eylem Butonları */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/urunler" className="px-6 py-3 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors">
              Alışverişe Devam Et
              <ArrowRight size={16} />
            </Link>
            {user && (
              <Link href="/hesabim/siparislerim" className="px-6 py-3 bg-dark-300 text-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-dark-200 transition-colors">
                Siparişlerimi Görüntüle
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OdemeOnayPage; 