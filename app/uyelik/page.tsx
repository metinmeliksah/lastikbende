'use client';

import { useState } from 'react';
import UserProfile from './components/UserProfile';
import OrderList from './components/OrderList';
import SettingsForm from './components/SettingsForm';
import DashboardTabs from './components/DashboardTabs';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90 5XX XXX XXXX',
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

  const handleSaveSettings = (data: { name: string; email: string; phone: string }) => {
    setUserData({...userData, ...data});
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-dark-300 rounded-lg shadow-lg p-6 border border-dark-100">
          <UserProfile name={userData.name} email={userData.email} />
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-2 text-gray-100">Üyelik Bilgileri</h3>
                  <p className="text-gray-400">Üyelik Başlangıcı: {userData.memberSince}</p>
                  <p className="text-gray-400">Toplam Sipariş: {userData.orders}</p>
                </div>
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-2 text-gray-100">İletişim Tercihleri</h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="emailNotif" 
                      className="rounded bg-dark-100 border-dark-100 text-primary focus:ring-primary" 
                    />
                    <label htmlFor="emailNotif" className="text-gray-400">E-posta bildirimleri</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-4 text-gray-100">Son Siparişler</h3>
                  <OrderList orders={orders} />
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