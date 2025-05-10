'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  CircleDollarSign,
  Table2,
  FormInput,
  Box,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MenuItem {
  title: string;
  path: string;
  icon: JSX.Element;
  section?: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/bayi',
    icon: <LayoutDashboard className="w-5 h-5" />,
    section: 'HOME'
  },
  {
    title: 'Gelir Takibi',
    path: '/bayi/gelir',
    icon: <CircleDollarSign className="w-5 h-5" />,
    section: 'HOME'
  },
  {
    title: 'Lastik Tablosu',
    path: '/bayi/lastikler',
    icon: <Table2 className="w-5 h-5" />,
    section: 'UTILITIES'
  },
  {
    title: 'Lastik Ekle',
    path: '/bayi/lastik-ekle',
    icon: <FormInput className="w-5 h-5" />,
    section: 'UTILITIES'
  },
  {
    title: 'Stok Yönetimi',
    path: '/bayi/stok',
    icon: <Box className="w-5 h-5" />,
    section: 'UTILITIES'
  },
  {
    title: 'Siparişler',
    path: '/bayi/siparisler',
    icon: <ShoppingCart className="w-5 h-5" />,
    section: 'MANAGEMENT'
  },
  {
    title: 'Raporlar',
    path: '/bayi/raporlar',
    icon: <BarChart3 className="w-5 h-5" />,
    section: 'MANAGEMENT'
  }
];

interface BayiSidebarProps {
  sellerData: any;
}

export default function BayiSidebar({ sellerData }: BayiSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [bayiAdi, setBayiAdi] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchBayiData() {
      if (!sellerData?.bayi?.id) return;

      const { data: bayiData, error } = await supabase
        .from('sellers')
        .select('isim')
        .eq('id', sellerData.bayi.id)
        .single();

      if (!error && bayiData) {
        setBayiAdi(bayiData.isim);
      }
    }

    fetchBayiData();
  }, [sellerData, supabase]);

  // Gruplanan menü öğeleri
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section || '']) {
      acc[item.section || ''] = [];
    }
    acc[item.section || ''].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    // Güvenli yönlendirme
    setTimeout(() => {
      router.push('/bayi/giris');
    }, 100);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <Image
              src="https://npqvsvfkmrrbbkxxkrpl.supabase.co/storage/v1/object/public/logo//logo.png"
              alt="LastikBende"
              width={130}
              height={55}
              className="rounded-lg"
            />
          </div>
          <div className="text-center text-purple-600 font-medium mb-6">
            {bayiAdi}
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
                          ? 'bg-[#7B68EE] text-white' 
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
              href="/bayi/ayarlar"
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${pathname === '/bayi/ayarlar' 
                  ? 'bg-[#7B68EE] text-white' 
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