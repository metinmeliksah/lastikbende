'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const OdemeOnayPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siparisNo = searchParams.get('siparisNo');
  const [loading, setLoading] = useState(true);
  const [siparisDetay, setSiparisDetay] = useState<any>(null);

  useEffect(() => {
    if (!siparisNo) {
      toast.error('Sipariş numarası bulunamadı');
      router.push('/sepet');
      return;
    }

    const fetchSiparisDetay = async () => {
      try {
        setLoading(true);
        
        // API endpointini güncelliyoruz - siparisNo yerine siparisId kullanmalıyız
        // Ancak şu an siparisNo bilgisi geldiği için önceki uyumluluğu koruyoruz
        const response = await fetch(`/api/siparis?siparisId=${siparisNo}`);
        
        if (!response.ok) {
          throw new Error('Sipariş detayları alınamadı');
        }
        
        const data = await response.json();
        setSiparisDetay(data.data);
      } catch (error) {
        console.error('Sipariş detayları alınamadı:', error);
        // API'den veri alamadığımız için demo verisi kullanıyoruz
        // Gerçek uygulamada bu kısım olmamalı
        setSiparisDetay({
          siparisId: siparisNo,
          tarih: new Date().toLocaleDateString('tr-TR'),
          odeme: {
            yontem: searchParams.get('yontem') || 'credit-card',
            durum: searchParams.get('yontem') === 'bank-transfer' ? 'beklemede' : 'onaylandi'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSiparisDetay();
  }, [siparisNo, router, searchParams]);

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Başlık ve Onay İkonu */}
          <div className="text-center mb-10">
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
          </div>

          {/* Sipariş Bilgileri */}
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
                    <p className="font-semibold text-white">{siparisNo}</p>
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
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
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
                    <p className="font-medium text-white">İş Bankası</p>
                    <p className="text-sm">IBAN: TR42 3456 7890 1234 5678 9012 99</p>
                    <p className="text-sm">Hesap Sahibi: LastikBende A.Ş.</p>
                  </div>
                  <p className="text-sm bg-yellow-800/30 p-3 rounded-lg border border-yellow-800">
                    <strong>Önemli Not:</strong> Havale/EFT işleminizi gerçekleştirirken açıklama kısmına sipariş numaranızı
                    (<span className="font-semibold">{siparisNo}</span>) yazmayı unutmayınız.
                  </p>
                </div>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Sonraki Adımlar</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 text-primary p-2 rounded-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Sipariş Hazırlanıyor</p>
                    <p className="text-gray-400 text-sm">Siparişiniz ekibimiz tarafından hazırlanıyor.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 text-primary p-2 rounded-lg">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Teslimat ve Montaj</p>
                    <p className="text-gray-400 text-sm">
                      {siparisDetay?.odeme?.yontem === 'bank-transfer'
                        ? 'Ödemeniz onaylandıktan sonra siparişinizin teslimatı gerçekleştirilecek.'
                        : 'Siparişinizin teslimatı ve montajı en kısa sürede gerçekleştirilecek.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/siparislerim"
              className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Siparişlerim
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="bg-transparent hover:bg-dark-300 text-white py-3 px-6 rounded-lg font-medium transition-colors border border-gray-700"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OdemeOnayPage; 