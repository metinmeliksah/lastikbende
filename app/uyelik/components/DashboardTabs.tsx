'use client';

import { UserIcon, ShoppingBagIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex border-b border-dark-100 mb-6">
      <button
        onClick={() => onTabChange('profile')}
        className={`px-4 py-2 flex items-center space-x-2 ${
          activeTab === 'profile'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-300 hover:text-primary'
        }`}
      >
        <UserIcon className="h-5 w-5" />
        <span>Profil Bilgileri</span>
      </button>
      <button
        onClick={() => onTabChange('orders')}
        className={`px-4 py-2 flex items-center space-x-2 ${
          activeTab === 'orders'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-300 hover:text-primary'
        }`}
      >
        <ShoppingBagIcon className="h-5 w-5" />
        <span>Siparişlerim</span>
      </button>
      <button
        onClick={() => onTabChange('settings')}
        className={`px-4 py-2 flex items-center space-x-2 ${
          activeTab === 'settings'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-300 hover:text-primary'
        }`}
      >
        <Cog6ToothIcon className="h-5 w-5" />
        <span>Ayarlar</span>
      </button>
    </div>
  );
} 