'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import OrderTimeline from './OrderTimeline';
import OrderStatusBadge from './OrderStatusBadge';

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

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  siparis: Siparis | null;
}

export default function OrderDetailModal({ isOpen, onClose, siparis }: OrderDetailModalProps) {
  if (!siparis) return null;

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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-dark-300 border border-dark-100 text-left align-middle shadow-xl transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-100">
                  <div className="flex items-center gap-4">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-100">
                      Sipariş Detayı #{siparis.siparis_no || siparis.id}
                    </Dialog.Title>
                    <OrderStatusBadge status={siparis.durum} />
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sol Taraf - Sipariş Bilgileri */}
                    <div className="space-y-6">
                      {/* Genel Bilgiler */}
                      <div className="bg-dark-400 rounded-lg p-4 border border-dark-100">
                        <h4 className="text-lg font-medium text-gray-100 mb-4">Sipariş Bilgileri</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sipariş No:</span>
                            <span className="text-gray-200 font-medium">{siparis.siparis_no || siparis.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sipariş Tarihi:</span>
                            <span className="text-gray-200">{formatDate(siparis.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Son Güncelleme:</span>
                            <span className="text-gray-200">{formatDate(siparis.updated_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Teslimat Tipi:</span>
                            <span className="text-gray-200">
                              {siparis.teslimat_tipi === 'adres' ? 'Adrese Teslimat' : 'Mağazadan Teslim'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fiyat Bilgileri */}
                      <div className="bg-dark-400 rounded-lg p-4 border border-dark-100">
                        <h4 className="text-lg font-medium text-gray-100 mb-4">Fiyat Detayları</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ürünler Toplamı:</span>
                            <span className="text-gray-200">{formatPrice(siparis.toplam_tutar)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Kargo Ücreti:</span>
                            <span className="text-gray-200">
                              {siparis.kargo_ucreti > 0 ? formatPrice(siparis.kargo_ucreti) : 'Ücretsiz'}
                            </span>
                          </div>
                          <div className="border-t border-dark-100 pt-3">
                            <div className="flex justify-between text-lg font-semibold">
                              <span className="text-gray-100">Genel Toplam:</span>
                              <span className="text-primary">{formatPrice(siparis.genel_toplam)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* İptal Notları */}
                      {siparis.durum === 'siparis_iptal' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                          <h4 className="text-red-400 font-medium mb-2">İptal Bilgisi</h4>
                          <p className="text-gray-300 text-sm">
                            Siparişiniz iptal edilmiştir. Herhangi bir ödeme yapılmışsa, iadeniz 3-5 iş günü içinde hesabınıza yansıtılacaktır.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sağ Taraf - Timeline */}
                    <div>
                      <OrderTimeline status={siparis.durum} orderDate={siparis.created_at} />
                    </div>
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-primary text-xl">ℹ️</div>
                      <div>
                        <h5 className="text-gray-100 font-medium mb-2">Önemli Bilgiler</h5>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Sipariş detayları ve ürün bilgileri için müşteri hizmetleri ile iletişime geçebilirsiniz.</li>
                          <li>• Teslimat süresi, ürün ve bölgeye göre değişiklik gösterebilir.</li>
                          <li>• Herhangi bir sorunuz için 7/24 destek hattımızdan yardım alabilirsiniz.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-dark-100 bg-dark-400">
                  <button
                    type="button"
                    className="px-6 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Kapat
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 