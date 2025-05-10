'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, Search, Menu, X, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface YoneticiHeaderProps {
  notifications: { id: number; title: string; time: string }[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  managerData: any;
}

export default function YoneticiHeader({ notifications, isSidebarOpen, setIsSidebarOpen, managerData }: YoneticiHeaderProps) {
  // Yönetici adını oluştur
  const managerFullName = managerData ? `${managerData.first_name} ${managerData.last_name}` : 'Yönetici';
  
  // Baş harfleri oluştur
  const initials = managerData ? 
    `${managerData.first_name?.charAt(0)}${managerData.last_name?.charAt(0)}` : 
    'Y';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b yonetici-header z-30 mt-0 pt-0 sticky top-0">
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

        </div>

        <div className="flex items-center gap-4">

          {/* Kullanıcı Menüsü */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm mr-2">
                  {initials}
                </div>
                <span className="hidden md:block font-medium text-sm">{managerFullName}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                <div className="pt-2 pb-1 px-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{managerFullName}</p>
                  <p className="text-xs text-gray-500">{managerData?.position || 'Yönetici'}</p>
                </div>
                <div className="py-1">
                  <Link href="/yonetici/profil">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Profilim
                    </div>
                  </Link>
                  <Link href="/yonetici/ayarlar">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2 text-gray-500" />
                      Ayarlar
                    </div>
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      localStorage.removeItem('managerData');
                      window.location.href = '/yonetici/giris';
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 