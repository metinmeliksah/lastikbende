'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ShoppingCart, 
  Settings, 
  LogOut,
  User,
  HeadphonesIcon,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  title: string;
  path: string;
  icon: JSX.Element;
  section?: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/yonetici',
    icon: <LayoutDashboard className="w-5 h-5" />,
    section: 'ANA MENÜ'
  },
  {
    title: 'Destek Talepleri',
    path: '/yonetici/destek',
    icon: <HeadphonesIcon className="w-5 h-5" />,
    section: 'ANA MENÜ'
  },
  {
    title: 'Bayiler',
    path: '/yonetici/bayiler',
    icon: <Users className="w-5 h-5" />,
    section: 'YÖNETİM'
  },
  {
    title: 'Bayi Ekle',
    path: '/yonetici/bayiler/ekle',
    icon: <UserPlus className="w-5 h-5" />,
    section: 'YÖNETİM'
  },
  {
    title: 'Üyeler',
    path: '/yonetici/uyeler',
    icon: <User className="w-5 h-5" />,
    section: 'YÖNETİM'
  },
  {
    title: 'Siparişler',
    path: '/yonetici/siparisler',
    icon: <ShoppingCart className="w-5 h-5" />,
    section: 'SİPARİŞ YÖNETİMİ'
  }
];

interface YoneticiSidebarProps {
  isSidebarOpen: boolean;
  managerData: any;
}

export default function YoneticiSidebar({ isSidebarOpen, managerData }: YoneticiSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Gruplanan menü öğeleri
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section || '']) {
      acc[item.section || ''] = [];
    }
    acc[item.section || ''].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // DOM hatasını önlemek için sidebar'ın görünürlüğünü değiştirirken 
  // uygulanacak animasyon
  useEffect(() => {
    if (sidebarRef.current) {
      if (isSidebarOpen) {
        sidebarRef.current.style.transform = 'translateX(0)';
      } else {
        sidebarRef.current.style.transform = 'translateX(-100%)';
      }
    }
  }, [isSidebarOpen]);

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    // Güvenli yönlendirme
    setTimeout(() => {
      router.push('/yonetici/giris');
    }, 100);
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`yonetici-nav
        fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 border-r border-gray-100
      `}
    >
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/logo.png"
              alt="LastikBende"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-xl font-semibold text-gray-900">LastikBende</span>
          </div>
          <div className="mb-8 border-t border-gray-100 pt-2">
          </div>

          <div className="space-y-8">
            {Object.entries(groupedMenuItems).map(([section, items]) => (
              <div key={section}>
                <h3 className="text-xs font-semibold text-gray-400 mb-4">{section}</h3>
                <nav className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${pathname === item.path 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t">
          <div className="space-y-1">
            <Link
              href="/yonetici/ayarlar"
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${pathname === '/yonetici/ayarlar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              Ayarlar
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
} 