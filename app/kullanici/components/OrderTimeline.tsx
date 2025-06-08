'use client';

import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  date?: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
}

interface OrderTimelineProps {
  status: string;
  orderDate: string;
}

export default function OrderTimeline({ status, orderDate }: OrderTimelineProps) {
  const getTimelineSteps = (currentStatus: string): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'siparis_alindi',
        title: 'Sipariş Alındı',
        description: 'Siparişiniz başarıyla alındı ve sistem tarafından kaydedildi.',
        date: orderDate,
        status: 'completed'
      },
      {
        id: 'siparis_onaylandi',
        title: 'Sipariş Onaylandı',
        description: 'Siparişiniz incelendi ve onaylandı.',
        status: 'pending'
      },
      {
        id: 'siparis_hazirlaniyor',
        title: 'Hazırlanıyor',
        description: 'Siparişiniz depo tarafından hazırlanıyor.',
        status: 'pending'
      },
      {
        id: 'siparis_teslimatta',
        title: 'Kargoda',
        description: 'Siparişiniz kargo firmasına teslim edildi.',
        status: 'pending'
      },
      {
        id: 'siparis_tamamlandi',
        title: 'Teslim Edildi',
        description: 'Siparişiniz başarıyla teslim edildi.',
        status: 'pending'
      }
    ];

    // İptal durumu kontrolü
    if (currentStatus === 'siparis_iptal') {
      return steps.map(step => ({
        ...step,
        status: step.id === 'siparis_alindi' ? 'completed' : 'cancelled'
      }));
    }

    // Normal durum akışı
    const statusOrder = ['siparis_alindi', 'siparis_onaylandi', 'siparis_hazirlaniyor', 'siparis_teslimatta', 'siparis_tamamlandi'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'completed' : 
              index === currentIndex ? 'current' : 'pending'
    }));
  };

  const timelineSteps = getTimelineSteps(status);

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckIcon className="w-5 h-5 text-white" />;
      case 'current':
        return <ClockIcon className="w-5 h-5 text-white" />;
      case 'cancelled':
        return <XMarkIcon className="w-5 h-5 text-white" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStepClasses = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-primary border-primary animate-pulse';
      case 'cancelled':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-500 border-gray-500';
    }
  };

  const getConnectorClasses = (stepStatus: string, nextStepStatus: string) => {
    if (stepStatus === 'completed' && (nextStepStatus === 'completed' || nextStepStatus === 'current')) {
      return 'bg-green-500';
    }
    if (stepStatus === 'cancelled' || nextStepStatus === 'cancelled') {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  // İptal durumu için özel mesaj
  if (status === 'siparis_iptal') {
    return (
      <div className="bg-dark-300 rounded-lg p-6 border border-dark-100">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Sipariş Durumu</h3>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <XMarkIcon className="w-6 h-6 text-red-400 mr-3" />
            <div>
              <h4 className="text-red-400 font-medium">Sipariş İptal Edildi</h4>
              <p className="text-gray-300 text-sm mt-1">
                Siparişiniz iptal edilmiştir. Herhangi bir ödeme yapılmışsa, iadeniz işleme alınacaktır.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-300 rounded-lg p-6 border border-dark-100">
      <h3 className="text-lg font-medium text-gray-100 mb-6">Sipariş Takip</h3>
      
      <div className="relative">
        {timelineSteps.map((step, index) => (
          <div key={step.id} className="relative flex items-start pb-8 last:pb-0">
            {/* Bağlantı Çizgisi */}
            {index < timelineSteps.length - 1 && (
              <div 
                className={`absolute left-4 top-8 w-0.5 h-full ${getConnectorClasses(step.status, timelineSteps[index + 1].status)}`}
              />
            )}
            
            {/* İkon */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStepClasses(step.status)}`}>
              {getStepIcon(step.status)}
            </div>
            
            {/* İçerik */}
            <div className="ml-4 flex-1">
              <h4 className={`text-sm font-medium ${
                step.status === 'current' ? 'text-primary' : 
                step.status === 'completed' ? 'text-green-400' :
                step.status === 'cancelled' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {step.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {step.description}
              </p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(step.date).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 