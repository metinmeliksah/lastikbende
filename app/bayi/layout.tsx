'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BayiHeader from './components/BayiHeader';
import BayiFooter from './components/BayiFooter';
import BayiSidebar from './components/BayiSidebar';
import { Inter } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Ana layout font tanımı
const inter = Inter({ subsets: ['latin'] });

export default function BayiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [sellerData, setSellerData] = useState<any>(null);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth check effect
  useEffect(() => {
    if (!isMounted) return;

    const storedData = localStorage.getItem('sellerData');
    if (!storedData && !pathname?.startsWith('/bayi/giris')) {
      router.push('/bayi/giris');
      return;
    }

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setSellerData(data);
      } catch (error) {
        localStorage.removeItem('sellerData');
        if (!pathname?.startsWith('/bayi/giris')) {
          router.push('/bayi/giris');
        }
      }
    }
  }, [isMounted, pathname, router]);

  // Ana site elementlerini gizle
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const hideMainElements = () => {
      const mainNavbar = document.querySelector('nav:not(.bayi-nav)');
      const mainFooter = document.querySelector('footer:not(.bayi-footer)');
      const mainLayout = document.querySelector('main');

      if (mainNavbar) (mainNavbar as HTMLElement).style.display = 'none';
      if (mainFooter) (mainFooter as HTMLElement).style.display = 'none';
      
      if (mainLayout?.classList.contains('pt-20')) {
        mainLayout.classList.remove('pt-20');
        (mainLayout as HTMLElement).style.paddingTop = '0';
      }

      document.body.classList.add('bayi-panel-active');
      document.body.style.setProperty('background-color', '#F8F9FD', 'important');
      document.body.style.setProperty('padding-top', '0', 'important');
      document.body.style.setProperty('margin-top', '0', 'important');
    };

    hideMainElements();
    const observer = new MutationObserver(hideMainElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const mainNavbar = document.querySelector('nav:not(.bayi-nav)');
      const mainFooter = document.querySelector('footer:not(.bayi-footer)');
      const mainLayout = document.querySelector('main');

      if (mainNavbar) (mainNavbar as HTMLElement).style.display = '';
      if (mainFooter) (mainFooter as HTMLElement).style.display = '';
      
      if (mainLayout && !mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.add('pt-20');
        (mainLayout as HTMLElement).style.removeProperty('padding-top');
      }

      document.body.classList.remove('bayi-panel-active');
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('padding-top');
      document.body.style.removeProperty('margin-top');
    };
  }, [isMounted]);

  // Hydration için bekleme
  if (!isMounted) {
    return null;
  }

  // Giriş sayfası kontrolü
  if (pathname?.startsWith('/bayi/giris')) {
    return children;
  }

  // Panel sayfaları için ana layout
  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FD] flex`}>
      <BayiSidebar sellerData={sellerData} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <BayiHeader sellerData={sellerData} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
        <BayiFooter />
      </div>
    </div>
  );
} 