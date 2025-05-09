'use client';

import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function YoneticiGirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Giriş yapılmışsa ana sayfaya yönlendir
    const storedData = localStorage.getItem('managerData');
    if (storedData) {
      router.push('/yonetici');
      return;
    }

    if (typeof window === 'undefined') return;

    // Ana site ve yönetici modüllerini gizle
    const hideElements = () => {
      // Ana site elementlerini gizle
      const mainNavbar = document.querySelector('nav:not(.yonetici-nav)');
      const mainFooter = document.querySelector('footer:not(.yonetici-footer)');
      const mainLayout = document.querySelector('main');

      // Yönetici modüllerini tamamen kaldır
      const yoneticiElements = document.querySelectorAll('.yonetici-sidebar, .yonetici-header, .yonetici-footer');
      yoneticiElements.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });

      // Ana site elementlerini gizle
      if (mainNavbar) (mainNavbar as HTMLElement).style.display = 'none';
      if (mainFooter) (mainFooter as HTMLElement).style.display = 'none';
      
      if (mainLayout?.classList.contains('pt-20')) {
        mainLayout.classList.remove('pt-20');
        (mainLayout as HTMLElement).style.paddingTop = '0';
      }

      // Body stillerini ayarla
      document.body.classList.remove('yonetici-panel-active');
      document.body.classList.add('yonetici-giris-active');
      document.body.style.setProperty('background-color', '#F8F9FD', 'important');
      document.body.style.setProperty('padding-top', '0', 'important');
      document.body.style.setProperty('margin-top', '0', 'important');
    };

    // İlk yüklemede ve DOM değişikliklerinde elementleri gizle/kaldır
    hideElements();
    const observer = new MutationObserver((mutations) => {
      const hasNewYoneticiElements = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof Element && 
          (node.classList.contains('yonetici-sidebar') || 
           node.classList.contains('yonetici-header') || 
           node.classList.contains('yonetici-footer'))
        )
      );

      if (hasNewYoneticiElements) {
        hideElements();
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => {
      observer.disconnect();
      const mainNavbar = document.querySelector('nav:not(.yonetici-nav)');
      const mainFooter = document.querySelector('footer:not(.yonetici-footer)');
      const mainLayout = document.querySelector('main');

      // Ana site elementlerini göster
      if (mainNavbar) (mainNavbar as HTMLElement).style.display = '';
      if (mainFooter) (mainFooter as HTMLElement).style.display = '';
      
      if (mainLayout && !mainLayout.classList.contains('pt-20')) {
        mainLayout.classList.add('pt-20');
        (mainLayout as HTMLElement).style.removeProperty('padding-top');
      }

      document.body.classList.remove('yonetici-giris-active');
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('padding-top');
      document.body.style.removeProperty('margin-top');
    };
  }, [router]);

  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4`}>
      {children}
    </div>
  );
} 