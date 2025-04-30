'use client';

import { useEffect, useState } from 'react';
import { Check, Package, Truck, Wrench, ThumbsUp } from 'lucide-react';

interface OrderStep {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  status: 'completed' | 'current' | 'upcoming';
}

interface SepetVerisi {
  teslimatBilgileri: {
    tip: 'magaza' | 'adres';
  };
}

const OnayPage = () => {
  const [siparisNo, setSiparisNo] = useState<string>('');
  const [teslimatTipi, setTeslimatTipi] = useState<'magaza' | 'adres'>('adres');
  
  useEffect(() => {
    const storedSiparisNo = localStorage.getItem('siparisNo');
    const sepetVerisi = localStorage.getItem('sepetVerisi');
    
    if (storedSiparisNo) {
      setSiparisNo(storedSiparisNo);
    }
    
    if (sepetVerisi) {
      const parsedSepetVerisi: SepetVerisi = JSON.parse(sepetVerisi);
      setTeslimatTipi(parsedSepetVerisi.teslimatBilgileri.tip);
    }
  }, []);

  const getOrderSteps = (teslimatTipi: 'magaza' | 'adres'): OrderStep[] => {
    const baseSteps: OrderStep[] = [
      {
        id: 1,
        title: 'Sipariş Alındı',
        description: 'Siparişiniz başarıyla oluşturuldu',
        icon: <Check className="w-6 h-6" />,
        status: 'completed'
      },
      {
        id: 2,
        title: 'Sipariş Onaylandı',
        description: 'Siparişiniz onaylandı ve işleme alındı',
        icon: <Package className="w-6 h-6" />,
        status: 'current'
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

  const orderSteps = getOrderSteps(teslimatTipi);
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
            <div className="relative z-10 flex justify-between px-0">
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

          <div className="mt-8 p-6 bg-dark-400 rounded-lg border border-gray-700">
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
        </div>
      </div>
    </main>
  );
};

export default OnayPage; 