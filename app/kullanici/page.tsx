'use client';

import { useState } from 'react';
import UserProfile from './components/UserProfile';
import OrderList from './components/OrderList';
import SettingsForm from './components/SettingsForm';
import DashboardTabs from './components/DashboardTabs';
import SupportTickets from './components/SupportTickets';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [userData, setUserData] = useState({
    name: 'Metin',
    surname: 'Melikşah',
    email: 'mmdermencioglu@gmail.com',
    phone: '+90 555 555 5555',
    orders: 5,
    memberSince: '2024'
  });

  const orders = [
    {
      id: 1,
      date: '12 Mart 2024',
      status: 'Tamamlandı',
      total: '₺1,299.99',
      items: [
        { name: 'Lastik 1', quantity: 2, price: '₺599.99' },
        { name: 'Jant 1', quantity: 1, price: '₺100.00' }
      ]
    },
    {
      id: 2,
      date: '10 Mart 2024',
      status: 'Kargoda',
      total: '₺899.99',
      items: [
        { name: 'Lastik 2', quantity: 1, price: '₺899.99' }
      ]
    },
    {
      id: 3,
      date: '5 Mart 2024',
      status: 'İşleme Alındı',
      total: '₺1,599.99',
      items: [
        { name: 'Lastik 3', quantity: 4, price: '₺399.99' }
      ]
    }
  ];

  const handleSaveSettings = (data: { name: string; surname: string; email: string; phone: string }) => {
    setUserData({...userData, ...data});
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-dark-300 rounded-lg shadow-lg p-6 border border-dark-100">
          <UserProfile 
            name={userData.name}
            surname={userData.surname}
            email={userData.email}
          />
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-6">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-4 text-gray-100">Siparişlerim</h3>
                  <OrderList orders={orders} />
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <SupportTickets />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-4 text-gray-100">Hesap Ayarları</h3>
                  <SettingsForm 
                    initialData={{
                      name: userData.name,
                      surname: userData.surname,
                      email: userData.email,
                      phone: userData.phone
                    }}
                    onSave={handleSaveSettings}
                    onCancel={() => {}}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 