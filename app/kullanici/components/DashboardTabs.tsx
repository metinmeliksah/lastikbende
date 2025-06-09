'use client';

import { FiUser, FiSettings, FiShoppingBag, FiHeadphones } from 'react-icons/fi';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const tabs: Tab[] = [
    {
      id: 'profile',
      label: 'Profil Bilgileri',
      icon: FiUser,
    },
    {
      id: 'orders',
      label: 'Siparişlerim',
      icon: FiShoppingBag,
    },
    {
      id: 'settings',
      label: 'Hesap Ayarları',
      icon: FiSettings,
    },
    {
      id: 'support',
      label: 'Destek',
      icon: FiHeadphones,
    },
  ];

  return (
    <div className="border-b border-dark-100 mb-6">
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
} 