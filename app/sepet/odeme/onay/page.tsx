'use client';

import { useEffect, useState } from 'react';
import { Check, Package, Truck, Wrench, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface SiparisDetay {
  siparis_no: string;
  teslimat_tipi: 'magaza' | 'adres';
  durum: string;
  teslimat_adresi: any;
  magaza_bilgileri: any;
  fatura_adresi: any;
  toplam_tutar: number;
  kargo_ucreti: number;
  genel_toplam: number;
  siparis_urunleri: Array<{
    adet: number;
    birim_fiyat: number;
    toplam_fiyat: number;
    urunler: {
      isim: string;
      ebat: string;
      resim: string;
    };
  }>;
}

const OnayPage = () => {
  const [siparisNo, setSiparisNo] = useState<string>('');
  const [teslimatTipi, setTeslimatTipi] = useState<'magaza' | 'adres'>('adres');
  const [siparisDetay, setSiparisDetay] = useState<SiparisDetay | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedSiparisNo = localStorage.getItem('siparisNo');
    
    if (storedSiparisNo) {
      setSiparisNo(storedSiparisNo);
      fetchSiparisDetay(storedSiparisNo);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSiparisDetay = async (siparisNo: string) => {
    try {
      const response = await fetch(`/api/siparis?siparisNo=${siparisNo}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setSiparisDetay(result.data);
        setTeslimatTipi(result.data.teslimat_tipi);
      }
    } catch (error) {
      console.error('Sipariş detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderSteps = (teslimatTipi: 'magaza' | 'adres'): OrderStep[] => {
    const baseSteps: OrderStep[] = [
      {
        id: 1,
        title: 'Sipariş Alındı',
        description: 'Siparişiniz başarıyla oluşturuldu',
        icon: <Check className="w-6 h-6" />,
        status: 'current'
      },
      {
        id: 2,
        title: 'Sipariş Onaylandı',
        description: 'Siparişiniz onaylandı ve işleme alındı',
        icon: <Package className="w-6 h-6" />,
        status: 'upcoming'
      }
    ];

    const magazaSteps: OrderStep[] = [
      {
        id: 3,
        title: 'Montaj Aşaması',
        description: 'Lastikleriniz montaj için hazır',
        icon: <Wrench className="w-6 h-6" />,
        status: 'upcoming'
      },
      {
        id: 4,
        title: 'Tamamlandı',
        description: 'Siparişiniz başarıyla tamamlandı',
        icon: <ThumbsUp className="w-6 h-6" />,
        status: 'upcoming'
      }
    ];

    const adresSteps: OrderStep[] = [
      {
        id: 3,
        title: 'Kargoya Verildi',
        description: 'Siparişiniz kargoya teslim edildi',
        icon: <Truck className="w-6 h-6" />,
        status: 'upcoming'
      },
      {
        id: 4,
        title: 'Tamamlandı',
        description: 'Siparişiniz başarıyla tamamlandı',
        icon: <ThumbsUp className="w-6 h-6" />,
        status: 'upcoming'
      }
    ];

    return [...baseSteps, ...(teslimatTipi === 'magaza' ? magazaSteps : adresSteps)];
  };

  const updateStepStatus = (steps: OrderStep[], durum: string): OrderStep[] => {
    const durumIndex = {
      'siparis_alindi': 0,
      'onaylandi': 1,
      'montajda': 2,
      'kargoda': 2,
      'tamamlandi': 3
    }[durum] || 0;

    return steps.map((step, index) => ({
      ...step,
      status: index < durumIndex ? 'completed' : 
              index === durumIndex ? 'current' : 
              'upcoming'
    }));
  };

  const orderSteps = siparisDetay ? 
    updateStepStatus(getOrderSteps(teslimatTipi), siparisDetay.durum) : 
    getOrderSteps(teslimatTipi);

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-400 pt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-dark-300 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!siparisNo || !siparisDetay) {
    return (
      <main className="min-h-screen bg-dark-400 pt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-dark-300 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Sipariş Bulunamadı</h1>
              <p className="text-gray-400 mb-6">Sipariş detaylarına ulaşılamadı.</p>
              <Link 
                href="/sepet" 
                className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Sepete Dön
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const completedSteps = orderSteps.filter(step => step.status === 'completed').length;
  const currentStep = orderSteps.findIndex(step => step.status === 'current') + 1;
  const progressPercentage = ((currentStep - 0.5) / orderSteps.length) * 100;

  return (
    <main className="min-h-screen bg-dark-400 pt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-dark-300 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Siparişiniz Alındı!</h1>
            <p className="text-gray-400">Sipariş Numaranız: {siparisNo}</p>
          </div>

          <div className="relative mb-20">
            {/* Progress Line Container */}
            <div className="absolute top-1/2 left-[8%] right-[8%] -translate-y-1/2">
              {/* Progress Line */}
              <div className="w-full h-2 bg-gray-700 rounded-full" />
              
              {/* Progress Bar */}
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {orderSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center" style={{
                  width: `${100 / orderSteps.length}%`
                }}>
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 transition-all duration-500
                      ${step.status === 'completed' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 
                        step.status === 'current' ? 'bg-dark-300 border-primary text-primary shadow-lg shadow-primary/20' : 
                        'bg-dark-400 border-gray-700 text-gray-500'}`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-medium mb-2 text-lg transition-colors duration-500 ${
                      step.status === 'completed' ? 'text-primary' :
                      step.status === 'current' ? 'text-white' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      step.status === 'completed' ? 'text-primary/80' :
                      step.status === 'current' ? 'text-gray-300' :
                      'text-gray-500'
                    } hidden md:block max-w-[200px] mx-auto`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Sipariş Durumu</h2>
              <p className="text-gray-300">
                {teslimatTipi === 'magaza' 
                  ? 'Siparişiniz onaylandı ve mağazada montaj için hazırlanıyor.'
                  : 'Siparişiniz onaylandı ve kargoya hazırlanıyor.'}
              </p>
              <div className="mt-4 text-sm text-gray-400">
                Tahmini Teslimat: {teslimatTipi === 'magaza' ? '1-2 iş günü' : '2-3 iş günü'}
              </div>
            </div>

            {/* Sipariş Detayları */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Sipariş Detayları</h2>
              
              {/* Ürünler */}
              <div className="space-y-4 mb-6">
                {siparisDetay.siparis_urunleri.map((urun, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-800">
                      <Image
                        src={urun.urunler.resim}
                        alt={urun.urunler.isim}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{urun.urunler.isim}</h3>
                      <p className="text-gray-400">{urun.urunler.ebat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{urun.toplam_fiyat.toLocaleString('tr-TR')} ₺</p>
                      <p className="text-sm text-gray-400">{urun.adet} adet</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Teslimat Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Teslimat Bilgileri</h3>
                  {teslimatTipi === 'magaza' ? (
                    <div className="text-gray-300">
                      <p className="font-medium">{siparisDetay.magaza_bilgileri.isim}</p>
                      <p>{siparisDetay.magaza_bilgileri.adres}</p>
                      <p>{siparisDetay.magaza_bilgileri.telefon}</p>
                    </div>
                  ) : (
                    <div className="text-gray-300">
                      <p className="font-medium">{siparisDetay.teslimat_adresi.isim}</p>
                      <p>{siparisDetay.teslimat_adresi.adres}</p>
                      <p>{siparisDetay.teslimat_adresi.telefon}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Fatura Bilgileri</h3>
                  <div className="text-gray-300">
                    <p className="font-medium">{siparisDetay.fatura_adresi.isim}</p>
                    <p>{siparisDetay.fatura_adresi.adres}</p>
                    <p>{siparisDetay.fatura_adresi.telefon}</p>
                  </div>
                </div>
              </div>

              {/* Ödeme Özeti */}
              <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-3">Ödeme Özeti</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Ara Toplam</span>
                    <span>{siparisDetay.toplam_tutar.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Kargo</span>
                    {siparisDetay.kargo_ucreti > 0 ? (
                      <span>{siparisDetay.kargo_ucreti.toLocaleString('tr-TR')} ₺</span>
                    ) : (
                      <span className="text-green-500">Ücretsiz</span>
                    )}
                  </div>
                  <div className="border-t border-gray-700 my-2 pt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Toplam</span>
                      <span>{siparisDetay.genel_toplam.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OnayPage; 