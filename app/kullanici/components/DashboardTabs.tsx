'use client';

import { useState } from 'react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const tabs = [
    { id: 'orders', label: 'Siparişlerim' },
    { id: 'support', label: 'Destek Taleplerim' },
    { id: 'settings', label: 'Ayarlar' }
  ];

  return (
    <div className="border-b border-dark-100 mb-6">
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-dark-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
} 