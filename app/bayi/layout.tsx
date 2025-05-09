'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BayiHeader from './components/BayiHeader';
import BayiFooter from './components/BayiFooter';
import BayiSidebar from './components/BayiSidebar';
import { Inter } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Ana layout font tanımı
const inter = Inter({ subsets: ['latin'] });

// Memoize edilmiş bileşenler
const MemoizedBayiSidebar = memo(BayiSidebar);
const MemoizedBayiHeader = memo(BayiHeader);
const MemoizedBayiFooter = memo(BayiFooter);

// Not: 'use client' direktifi ile metadata export edemeyiz
// Bu bilgiyi context veya data attribute ile taşıyabiliriz

export default function BayiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<number>(2);
  // Client-side rendering sırasında sunucu tarafında render edilmiş içerikle eşleşmeyen içerik oluşturmamak için
  const [isMounted, setIsMounted] = useState(false);
  const [bayiData, setBayiData] = useState(null);

  // Giriş sayfası ve alt path'lerinde hiçbir state, effect, sidebar, header, footer render etme!
  const isLoginPage = pathname?.startsWith('/bayi/giris');
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Ana sayfa navbar ve footer'ı gizle ve arka plan rengini değiştir
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Ana sayfanın navbar ve footer elementlerini seç ve gizle
    // Bayi sayfasına özgü sınıfları kullanarak seçicilerimizi daha spesifik hale getiriyoruz
    const mainNavbar = document.querySelector('nav:not(.bayi-nav)');
    const mainFooter = document.querySelector('footer:not(.bayi-footer)');
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
    
    // Bayi sayfası için stil ayarları
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
    
    // Bayi CSS sınıfını ekle
    bodyElement.classList.add('bayi-panel-active');
    
    // Temizlik işlevi
    return () => {
      showElement(mainNavbar);
      showElement(mainFooter);
      
      // Orijinal ana site stillerini geri yükle
      bodyElement.classList.remove('bayi-panel-active');
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
    styleEl.setAttribute('id', 'bayi-panel-styles');
    styleEl.innerHTML = `
      body.bayi-panel-active {
        background-color: #F8F9FD !important;
        color: #1f2937 !important;
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      body.bayi-panel-active main {
        padding-top: 0 !important;
      }
      .bayi-header {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      // Stil elementini temizle
      const styleElement = document.getElementById('bayi-panel-styles');
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

  // Yetkili olmayan kullanıcıları giriş sayfasına yönlendir
  useEffect(() => {
    if (!isMounted) return;
    
    // Giriş sayfasında layout kontrolü yapma
    if (pathname === '/bayi/giris') {
      return;
    }

    // LocalStorage'dan bayi verilerini kontrol et
    const storedData = localStorage.getItem('bayiSession') || sessionStorage.getItem('bayiSession');
    if (!storedData) {
      router.push('/bayi/giris');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setBayiData(data);
    } catch (error) {
      localStorage.removeItem('bayiSession');
      sessionStorage.removeItem('bayiSession');
      router.push('/bayi/giris');
    }
  }, [pathname, isMounted, router]);

  // Client tarafında monte edilene kadar boş div göster (hydration hatasını engeller)
  if (!isMounted) {
    return <div suppressHydrationWarning />;
  }

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FD] flex bayi-panel-active`} suppressHydrationWarning data-bayi-layout="true">
      {/* Sidebar */}
      <MemoizedBayiSidebar isSidebarOpen={isSidebarOpen} bayiData={bayiData} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <MemoizedBayiHeader 
          notifications={notifications} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          bayiData={bayiData}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bayi-content">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <MemoizedBayiFooter />
      </div>
    </div>
  );
} 