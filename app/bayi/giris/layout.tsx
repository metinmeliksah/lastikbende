'use client';

import { Inter } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function BayiGirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ana sayfa navbar ve footer'ı gizle ve body'e CSS sınıfı ekle
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Ana sayfanın navbar ve footer elementlerini seç ve gizle
    const mainNavbar = document.querySelector('nav:not(.bayi-nav)');
    const mainFooter = document.querySelector('footer:not(.bayi-footer)');
    const mainLayout = document.querySelector('main');
    
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
    
    // Body elementine sınıf ekle
    document.body.classList.add('bayi-panel-active');
    document.body.style.setProperty('background-color', '#F8F9FD', 'important');
    document.body.style.setProperty('color', '#1f2937', 'important');
    document.body.style.setProperty('padding-top', '0', 'important');
    document.body.style.setProperty('margin-top', '0', 'important');
    
    // Root main elementi içinde padding varsa temizle
    if (mainLayout) {
      if (mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.remove('pt-20');
      }
      (mainLayout as HTMLElement).style.paddingTop = '0';
    }
    
    // Temizlik işlevi
    return () => {
      showElement(mainNavbar);
      showElement(mainFooter);
      
      // Body elementinden sınıfı kaldır
      document.body.classList.remove('bayi-panel-active');
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('color');
      document.body.style.removeProperty('padding-top');
      document.body.style.removeProperty('margin-top');
      
      // Main elementi orijinal haline getir
      if (mainLayout && !mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.add('pt-20');
        (mainLayout as HTMLElement).style.removeProperty('padding-top');
      }
    };
  }, []);

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
} 