'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Order {
  id: number;
  date: string;
  status: string;
  total: string;
  items: {
    name: string;
    quantity: number;
    price: string;
  }[];
}

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-dark-100 rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-dark-300 transition-colors"
            onClick={() => toggleOrderDetails(order.id)}
          >
            <div>
              <p className="font-medium text-gray-100">Sipariş #{order.id}</p>
              <p className="text-sm text-gray-400">{order.date}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === 'Tamamlandı' ? 'bg-green-900 text-green-400' :
                order.status === 'Kargoda' ? 'bg-blue-900 text-blue-400' :
                'bg-yellow-900 text-yellow-400'
              }`}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Sipariş Detayları</h4>
                    <p className="text-gray-100">Sipariş No: #{order.id}</p>
                    <p className="text-gray-100">Tarih: {order.date}</p>
                    <p className="text-gray-100">Durum: {order.status}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Fatura Bilgileri</h4>
                    <p className="text-gray-100">Toplam: {order.total}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Ürünler</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-dark-100">
                        <div>
                          <p className="text-gray-100">{item.name}</p>
                          <p className="text-sm text-gray-400">Adet: {item.quantity}</p>
                        </div>
                        <p className="text-gray-100">{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 