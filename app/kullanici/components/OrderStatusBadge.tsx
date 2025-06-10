'use client';

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getDurumText = (durum: string) => {
    const durumMap: { [key: string]: string } = {
      'siparis_alindi': 'Sipariş Alındı',
      'siparis_onaylandi': 'Onaylandı',
      'siparis_hazirlaniyor': 'Hazırlanıyor',
      'siparis_teslimatta': 'Kargoda',
      'siparis_tamamlandi': 'Tamamlandı',
      'siparis_iptal': 'İptal Edildi',
      'hazırlanıyor': 'Hazırlanıyor',
      'beklemede': 'Beklemede'
    };
    return durumMap[durum] || durum;
  };

  const getDurumClass = (durum: string) => {
    const durumClasses: { [key: string]: string } = {
      'siparis_alindi': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'siparis_onaylandi': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'siparis_hazirlaniyor': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'siparis_teslimatta': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'siparis_tamamlandi': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'siparis_iptal': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'hazırlanıyor': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'beklemede': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    return durumClasses[durum] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDurumClass(status)}`}>
      {getDurumText(status)}
    </span>
  );
} 