'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import YoneticiHeader from './components/YoneticiHeader';
import YoneticiFooter from './components/YoneticiFooter';
import YoneticiSidebar from './components/YoneticiSidebar';
import { Inter } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';

const inter = Inter({ subsets: ['latin'] });

export default function YoneticiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [managerData, setManagerData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "Yeni destek talebi alındı", time: "10 dakika önce" },
    { id: 2, title: "Yeni sipariş oluşturuldu", time: "30 dakika önce" },
    { id: 3, title: "Stok uyarısı: Bazı ürünlerin stok seviyesi düşük", time: "1 saat önce" },
    { id: 4, title: "Ödeme işlemi tamamlandı", time: "3 saat önce" },
    { id: 5, title: "Haftalık rapor hazır", time: "1 gün önce" }
  ]);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth check effect
  useEffect(() => {
    if (!isMounted) return;

    // Giriş sayfasındaysak auth kontrolü yapma
    if (pathname?.startsWith('/yonetici/giris')) {
      return;
    }

    const storedData = localStorage.getItem('managerData');
    
    if (!storedData) {
      // Manager data yoksa giriş sayfasına yönlendir
      console.log('No manager data found, redirecting to login');
      router.push('/yonetici/giris');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      
      // Data geçerli mi kontrol et
      if (!data || !data.id || !data.email) {
        console.log('Invalid manager data, redirecting to login');
        localStorage.removeItem('managerData');
        router.push('/yonetici/giris');
        return;
      }

      // Durum kontrolü
      if (!data.durum) {
        console.log('Manager account suspended');
        localStorage.removeItem('managerData');
        router.push('/yonetici/giris');
        return;
      }

      setManagerData(data);
      console.log('Manager authenticated:', data.email);
    } catch (error) {
      console.error('Error parsing manager data:', error);
      localStorage.removeItem('managerData');
      router.push('/yonetici/giris');
    }
  }, [isMounted, pathname, router]);

  // Mobil kontrolü
  useEffect(() => {
    if (!isMounted || pathname?.startsWith('/yonetici/giris')) return;

    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSidebarOpen(width >= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMounted, pathname]);

  // Ana site elementlerini gizle
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const hideMainElements = () => {
      const mainNavbar = document.querySelector('nav:not(.yonetici-nav)');
      const mainFooter = document.querySelector('footer:not(.yonetici-footer)');
      const mainLayout = document.querySelector('main');

      if (mainNavbar) (mainNavbar as HTMLElement).style.display = 'none';
      if (mainFooter) (mainFooter as HTMLElement).style.display = 'none';
      
      if (mainLayout?.classList.contains('pt-20')) {
        mainLayout.classList.remove('pt-20');
        (mainLayout as HTMLElement).style.paddingTop = '0';
      }

      document.body.classList.add('yonetici-panel-active');
      document.body.style.setProperty('background-color', '#F8F9FD', 'important');
      document.body.style.setProperty('padding-top', '0', 'important');
      document.body.style.setProperty('margin-top', '0', 'important');
    };

    hideMainElements();
    const observer = new MutationObserver(hideMainElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const mainNavbar = document.querySelector('nav:not(.yonetici-nav)');
      const mainFooter = document.querySelector('footer:not(.yonetici-footer)');
      const mainLayout = document.querySelector('main');

      if (mainNavbar) (mainNavbar as HTMLElement).style.display = '';
      if (mainFooter) (mainFooter as HTMLElement).style.display = '';
      
      if (mainLayout && !mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.add('pt-20');
        (mainLayout as HTMLElement).style.removeProperty('padding-top');
      }

      document.body.classList.remove('yonetici-panel-active');
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('padding-top');
      document.body.style.removeProperty('margin-top');
    };
  }, [isMounted]);

  useEffect(() => {
    document.documentElement.setAttribute('data-panel', 'yonetici');
    return () => {
      document.documentElement.removeAttribute('data-panel');
    };
  }, []);

  // Hydration için bekleme
  if (!isMounted) {
    return null;
  }

  // Giriş sayfası kontrolü
  if (pathname?.startsWith('/yonetici/giris')) {
    return children;
  }

  // Panel sayfaları için ana layout
  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FD] flex`}>
      <YoneticiSidebar isSidebarOpen={isSidebarOpen} managerData={managerData} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <YoneticiHeader 
          notifications={notifications} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          managerData={managerData}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
        <YoneticiFooter />
      </div>
    </div>
  );
} 