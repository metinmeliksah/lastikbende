'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BayiData {
  id: number;
  bayi_id: number;
  ad: string;
  soyad: string;
  email: string;
  bayi: {
    id: number;
    isim: string;
    telefon: string;
    email: string;
    adres: string;
  };
}

interface BayiContextType {
  bayiData: BayiData | null;
  loading: boolean;
  setBayiData: (data: BayiData | null) => void;
}

const BayiContext = createContext<BayiContextType>({
  bayiData: null,
  loading: true,
  setBayiData: () => {}
});

export function BayiProvider({ children }: { children: React.ReactNode }) {
  const [bayiData, setBayiData] = useState<BayiData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBayiData = () => {
      try {
        const storedData = localStorage.getItem('sellerData');
        if (!storedData) {
          if (!window.location.pathname.startsWith('/bayi/giris')) {
            router.push('/bayi/giris');
          }
          return;
        }

        const data = JSON.parse(storedData);
        setBayiData(data);
      } catch (error) {
        console.error('Bayi verisi yüklenirken hata:', error);
        localStorage.removeItem('sellerData');
        if (!window.location.pathname.startsWith('/bayi/giris')) {
          router.push('/bayi/giris');
        }
      } finally {
        setLoading(false);
      }
    };

    checkBayiData();

    window.addEventListener('storage', checkBayiData);
    return () => {
      window.removeEventListener('storage', checkBayiData);
    };
  }, [router]);

  return (
    <BayiContext.Provider value={{ bayiData, loading, setBayiData }}>
      {children}
    </BayiContext.Provider>
  );
}

export const useBayi = () => {
  const context = useContext(BayiContext);
  if (context === undefined) {
    throw new Error('useBayi hook must be used within a BayiProvider');
  }
  return context;
}; 