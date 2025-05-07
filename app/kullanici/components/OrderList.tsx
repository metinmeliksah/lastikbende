'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Receipt, 
  Calendar, 
  Download, 
  MessageCircle,
  ExternalLink,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  date: string;
  status: string;
  total: string;
  processingDate?: string;
  shippingInfo?: {
    company: string;
    trackingNumber: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
  };
  deliveryInfo?: {
    deliveredTo: string;
    deliveryDate: string;
  };
  items: {
    id: number;
    name: string;
    quantity: number;
    price: string;
    imageUrl?: string;
    productUrl?: string;
  }[];
  timeline?: {
    status: string;
    date: string;
    description: string;
  }[];
  invoiceUrl?: string;
  invoiceStatus?: 'pending' | 'ready' | 'error';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

interface OrderListProps {
  orders: Order[];
  onSupportRequest?: () => void;
}

export default function OrderList({ orders, onSupportRequest }: OrderListProps) {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('date-desc');
  const [invoiceLoading, setInvoiceLoading] = useState<{ [key: number]: boolean }>({});

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'İşleme Alındı':
        return <Package className="w-5 h-5" />;
      case 'Kargoda':
        return <Truck className="w-5 h-5" />;
      case 'Tamamlandı':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'İşleme Alındı':
        return 'bg-blue-900 text-blue-400';
      case 'Kargoda':
        return 'bg-indigo-900 text-indigo-400';
      case 'Tamamlandı':
        return 'bg-green-900 text-green-400';
      default:
        return 'bg-yellow-900 text-yellow-400';
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'İşleme Alındı':
        return 'Siparişiniz paketleme aşamasında';
      case 'Kargoda':
        return 'Siparişiniz yolda';
      case 'Tamamlandı':
        return 'Siparişiniz teslim edildi';
      default:
        return 'Siparişiniz işleniyor';
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
  };

  const handleCreateSupportTicket = (order: Order) => {
    localStorage.setItem('supportTicketOrder', JSON.stringify({
      orderId: order.id,
      orderDate: order.date,
      orderTotal: order.total,
      orderStatus: order.status,
      orderItems: order.items
    }));
    if (onSupportRequest) onSupportRequest();
  };

  const handleGenerateInvoice = async (order: Order) => {
    try {
      setInvoiceLoading(prev => ({ ...prev, [order.id]: true }));

      // Sipariş verilerini fatura formatına dönüştür
      const invoiceData = {
        id: order.id,
        date: order.date,
        customerName: order.customerName || 'Müşteri',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        customerAddress: order.customerAddress || '',
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.replace(/[^0-9.-]+/g, '')),
        })),
        subtotal: parseFloat(order.total.replace(/[^0-9.-]+/g, '')),
        tax: parseFloat(order.total.replace(/[^0-9.-]+/g, '')) * 0.18,
        total: parseFloat(order.total.replace(/[^0-9.-]+/g, '')) * 1.18
      };

      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: invoiceData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fatura oluşturulamadı');
      }

      const data = await response.json();
      
      // Fatura URL'sini sipariş nesnesine ekle
      order.invoiceUrl = data.downloadUrl;
      order.invoiceStatus = 'ready';

      // Başarılı mesajı göster
      toast.success('Fatura başarıyla oluşturuldu');
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      order.invoiceStatus = 'error';
      toast.error(error instanceof Error ? error.message : 'Fatura oluşturulurken bir hata oluştu');
    } finally {
      setInvoiceLoading(prev => ({ ...prev, [order.id]: false }));
    }
  };

  // Filtreleme ve sıralama işlemleri
  const filteredAndSortedOrders = orders
    .filter(order => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'processing') return order.status === 'İşleme Alındı';
      if (activeFilter === 'shipping') return order.status === 'Kargoda';
      if (activeFilter === 'completed') return order.status === 'Tamamlandı';
      return true;
    })
    .sort((a, b) => {
      if (activeSort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (activeSort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (activeSort === 'total-desc') return parseFloat(b.total) - parseFloat(a.total);
      if (activeSort === 'total-asc') return parseFloat(a.total) - parseFloat(b.total);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Filtreler ve Sıralama */}
      <div className="bg-dark-200 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => handleFilterChange('processing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'processing' 
                  ? 'bg-blue-900 text-blue-400' 
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
              }`}
            >
              İşlemde
            </button>
            <button
              onClick={() => handleFilterChange('shipping')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'shipping' 
                  ? 'bg-indigo-900 text-indigo-400' 
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
              }`}
            >
              Kargoda
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'completed' 
                  ? 'bg-green-900 text-green-400' 
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
              }`}
            >
              Tamamlandı
            </button>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <select
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-dark-300 text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date-desc">En Yeni</option>
              <option value="date-asc">En Eski</option>
              <option value="total-desc">Tutar (Yüksek-Düşük)</option>
              <option value="total-asc">Tutar (Düşük-Yüksek)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sipariş Listesi */}
      <div className="space-y-4">
        {filteredAndSortedOrders.map((order) => (
          <div 
            key={order.id} 
            className="border border-dark-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-dark-300 transition-colors"
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div>
                <p className="font-medium text-gray-100">Sipariş #{order.id}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{order.date}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span 
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(order.status)}`}
                  title={getStatusTooltip(order.status)}
                >
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
                {expandedOrder === order.id ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedOrder === order.id && (
              <div className="border-t border-dark-100 p-4 bg-dark-300">
                <div className="space-y-4">
                  {/* Sipariş Zaman Çizelgesi */}
                  {order.timeline && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Sipariş Durumu</h4>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-100"></div>
                        <div className="space-y-4">
                          {order.timeline.map((step, index) => (
                            <div key={index} className="relative pl-10">
                              <div className="absolute left-0 w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center">
                                {getStatusIcon(step.status)}
                              </div>
                              <div>
                                <p className="text-gray-100 font-medium">{step.status}</p>
                                <p className="text-sm text-gray-400">{step.date}</p>
                                <p className="text-sm text-gray-400">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Sipariş Detayları</h4>
                      <p className="text-gray-100">Sipariş No: #{order.id}</p>
                      <p className="text-gray-100">Tarih: {order.date}</p>
                      <p className="text-gray-100">Durum: {order.status}</p>
                      {order.processingDate && (
                        <p className="text-gray-100">İşleme Alınma: {order.processingDate}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Fatura Bilgileri</h4>
                      <p className="text-gray-100">Toplam: {order.total}</p>
                      {order.invoiceUrl ? (
                        <button 
                          className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                          onClick={async () => {
                            if (!order.invoiceUrl) {
                              toast.error('Fatura URL\'i bulunamadı');
                              return;
                            }
                            try {
                              const response = await fetch(order.invoiceUrl);
                              if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                              }
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `FTR-${order.id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error('Fatura indirme hatası:', error);
                              toast.error('Fatura indirilirken bir hata oluştu');
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Faturayı İndir
                        </button>
                      ) : order.invoiceStatus === 'error' ? (
                        <button 
                          className="mt-2 flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                          onClick={() => handleGenerateInvoice(order)}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Tekrar Dene
                        </button>
                      ) : (
                        <button 
                          className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                          onClick={() => handleGenerateInvoice(order)}
                          disabled={invoiceLoading[order.id]}
                        >
                          {invoiceLoading[order.id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Fatura Hazırlanıyor...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Fatura Oluştur
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {order.shippingInfo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Kargo Bilgileri</h4>
                      <div className="bg-dark-200 p-3 rounded-lg">
                        <p className="text-gray-100">Kargo Firması: {order.shippingInfo.company}</p>
                        <p className="text-gray-100">Takip No: {order.shippingInfo.trackingNumber}</p>
                        {order.shippingInfo.estimatedDelivery && (
                          <p className="text-gray-100">Tahmini Teslimat: {order.shippingInfo.estimatedDelivery}</p>
                        )}
                        {order.shippingInfo.trackingUrl && (
                          <a 
                            href={order.shippingInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Kargoyu Takip Et
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {order.deliveryInfo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Teslimat Bilgileri</h4>
                      <div className="bg-dark-200 p-3 rounded-lg">
                        <p className="text-gray-100">Teslim Alan: {order.deliveryInfo.deliveredTo}</p>
                        <p className="text-gray-100">Teslim Tarihi: {order.deliveryInfo.deliveryDate}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Ürünler</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-2 border-b border-dark-100">
                          <div className="w-16 h-16 bg-dark-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            {item.productUrl ? (
                              <Link 
                                href={item.productUrl}
                                className="text-gray-100 hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <p className="text-gray-100">{item.name}</p>
                            )}
                            <p className="text-sm text-gray-400">Adet: {item.quantity}</p>
                          </div>
                          <p className="text-gray-100">{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destek Talebi Butonu */}
                  <div className="flex justify-end">
                    <button 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-dark-100 transition-colors"
                      onClick={() => handleCreateSupportTicket(order)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Destek Talebi Oluştur</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 