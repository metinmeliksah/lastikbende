'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import YoneticiHeader from './components/YoneticiHeader';
import YoneticiFooter from './components/YoneticiFooter';
import YoneticiSidebar from './components/YoneticiSidebar';
import YoneticiLoginHeader from './components/YoneticiLoginHeader';
import YoneticiLoginFooter from './components/YoneticiLoginFooter';
import { Inter } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Ana layout font tanımı
const inter = Inter({ subsets: ['latin'] });

// Memoize edilmiş bileşenler
const MemoizedYoneticiSidebar = memo(YoneticiSidebar);
const MemoizedYoneticiHeader = memo(YoneticiHeader);
const MemoizedYoneticiFooter = memo(YoneticiFooter);

// Not: 'use client' direktifi ile metadata export edemeyiz
// Bu bilgiyi context veya data attribute ile taşıyabiliriz

export default function YoneticiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; title: string; time: string }[]>([
    { id: 1, title: "Yeni destek talebi alındı", time: "10 dakika önce" },
    { id: 2, title: "Yeni sipariş oluşturuldu", time: "30 dakika önce" },
    { id: 3, title: "Stok uyarısı: Bazı ürünlerin stok seviyesi düşük", time: "1 saat önce" },
    { id: 4, title: "Ödeme işlemi tamamlandı", time: "3 saat önce" },
    { id: 5, title: "Haftalık rapor hazır", time: "1 gün önce" }
  ]);
  // Client-side rendering sırasında sunucu tarafında render edilmiş içerikle eşleşmeyen içerik oluşturmamak için
  const [isMounted, setIsMounted] = useState(false);
  const [managerData, setManagerData] = useState<any>(null);

  // Ana sayfa navbar ve footer'ı gizle ve arka plan rengini değiştir
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Ana sayfanın navbar ve footer elementlerini seç ve gizle
    // Yönetici sayfasına özgü sınıfları kullanarak seçicilerimizi daha spesifik hale getiriyoruz
    const mainNavbar = document.querySelector('nav:not(.yonetici-nav)');
    const mainFooter = document.querySelector('footer:not(.yonetici-footer)');
    const mainLayout = document.querySelector('main');
    const bodyElement = document.body;
    
    // Stil eklemek için fonksiyon
    const hideElement = (element: Element | null) => {
      if (element) {
        (element as HTMLElement).style.display = 'none';
      }
    };

    // Stil kaldırmak için fonksiyon
    const showElement = (element: Element | null) => {
      if (element) {
        (element as HTMLElement).style.display = '';
      }
    };
    
    // Ana sayfa elemanlarını gizle
    hideElement(mainNavbar);
    hideElement(mainFooter);
    
    // Siyah arka planı ve padding'i kaldır
    // Orijinal stilleri sakla
    const originalBodyColor = bodyElement.className;
    
    // Yönetici sayfası için stil ayarları
    bodyElement.style.setProperty('background-color', '#F8F9FD', 'important');
    bodyElement.style.setProperty('color', '#1f2937', 'important');
    bodyElement.style.setProperty('padding-top', '0', 'important');
    bodyElement.style.setProperty('margin-top', '0', 'important');
    
    // Root main elementi içinde padding varsa temizle
    if (mainLayout) {
      if (mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.remove('pt-20');
      }
      (mainLayout as HTMLElement).style.paddingTop = '0';
    }
    
    // Yönetici CSS sınıfını ekle
    bodyElement.classList.add('yonetici-panel-active');
    
    // Temizlik işlevi
    return () => {
      showElement(mainNavbar);
      showElement(mainFooter);
      
      // Orijinal ana site stillerini geri yükle
      bodyElement.classList.remove('yonetici-panel-active');
      bodyElement.style.removeProperty('background-color');
      bodyElement.style.removeProperty('color');
      bodyElement.style.removeProperty('padding-top');
      bodyElement.style.removeProperty('margin-top');
      
      // Main elementi orijinal haline getir
      if (mainLayout && !mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.add('pt-20');
        (mainLayout as HTMLElement).style.removeProperty('padding-top');
      }
    };
  }, []);

  // Global CSS ekleyen effect - üstteki siyah bölümü kaldırmak için
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Inline stil eklemek yerine, document head'e global CSS ekleyelim
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'yonetici-panel-styles');
    styleEl.innerHTML = `
      body.yonetici-panel-active {
        background-color: #F8F9FD !important;
        color: #1f2937 !important;
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      body.yonetici-panel-active main {
        padding-top: 0 !important;
      }
      .yonetici-header {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      // Stil elementini temizle
      const styleElement = document.getElementById('yonetici-panel-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  // Mobil kontrolü için memoized fonksiyon
  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSidebarOpen(width >= 768);
    }
  }, []);

  useEffect(() => {
    // Client-side render sonrası bileşeni monte et
    setIsMounted(true);
    
    if (typeof window === 'undefined') return;
    
    checkMobile();
    
    // Debounced resize handler ekleyelim, sürekli güncelleme yapmayalım
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkMobile();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkMobile]);

  // Giriş sayfası mı kontrolü için memoized değer
  const isLoginPage = useMemo(() => pathname === '/yonetici/giris', [pathname]);

  // Yetkili olmayan kullanıcıları giriş sayfasına yönlendir
  useEffect(() => {
    if (!isMounted) return;
    
    // Giriş sayfasında layout kontrolü yapma
    if (pathname === '/yonetici/giris') {
      // Eğer giriş sayfasındaysa ve managerData varsa ana sayfaya yönlendir
      const storedData = localStorage.getItem('managerData');
      if (storedData) {
        router.push('/yonetici');
      }
      return;
    }

    // LocalStorage'dan yönetici verilerini kontrol et
    const storedData = localStorage.getItem('managerData');
    if (!storedData) {
      router.push('/yonetici/giris');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setManagerData(data);
    } catch (error) {
      localStorage.removeItem('managerData');
      router.push('/yonetici/giris');
    }
  }, [pathname, isMounted]);

  // Client tarafında monte edilene kadar boş div göster (hydration hatasını engeller)
  if (!isMounted) {
    return <div suppressHydrationWarning />;
  }

  if (isLoginPage) {
    return (
      <div className={`${inter.className} min-h-screen bg-[#F8F9FD] flex flex-col yonetici-panel-active`} suppressHydrationWarning data-yonetici-layout="true">
        <YoneticiLoginHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        <YoneticiLoginFooter />
      </div>
    )
  }

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FD] flex yonetici-panel-active`} suppressHydrationWarning data-yonetici-layout="true">
      {/* Sidebar */}
      <MemoizedYoneticiSidebar isSidebarOpen={isSidebarOpen} managerData={managerData} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <MemoizedYoneticiHeader 
          notifications={notifications} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          managerData={managerData}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto yonetici-content">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <MemoizedYoneticiFooter />
      </div>
    </div>
  );
} 