'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, Search, Menu, X } from 'lucide-react';

interface BayiHeaderProps {
  notifications: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  bayiData: any;
}

export default function BayiHeader({ notifications, isSidebarOpen, setIsSidebarOpen, bayiData }: BayiHeaderProps) {
  const userFirstName = bayiData?.user?.first_name || '';
  const userLastName = bayiData?.user?.last_name || '';
  const fullName = userFirstName && userLastName ? `${userFirstName} ${userLastName}` : 'Bayi Yetkilisi';
  const initials = userFirstName && userLastName ? `${userFirstName[0]}${userLastName[0]}`.toUpperCase() : 'BY';

  return (
    <header className="bg-white border-b bayi-header z-30 mt-0 pt-0 sticky top-0">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-gray-500 hover:text-gray-600"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ara..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-600">
            <Bell className="w-6 h-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">{initials}</span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">Ahmet Yılmaz</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 