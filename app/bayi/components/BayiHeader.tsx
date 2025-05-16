'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BayiHeaderProps {
  sellerData: any;
}

export default function BayiHeader({ sellerData }: BayiHeaderProps) {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUserData() {
      if (!sellerData?.id) return;

      // seller_managers tablosundan kullanıcı bilgilerini çek
      const { data: managerData, error: managerError } = await supabase
        .from('seller_managers')
        .select('ad, soyad')
        .eq('id', sellerData.id)
        .single();

      if (managerError) {
        console.error('Manager data fetch error:', managerError);
        return;
      }

      if (managerData) {
        setAd(managerData.ad);
        setSoyad(managerData.soyad);
      }
    }

    fetchUserData();
  }, [sellerData, supabase]);

  const handleLogout = () => {
    localStorage.removeItem('sellerData');
    window.location.href = '/bayi/giris';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Ana Siteye Dön</span>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-8 h-8 bg-[#4B5563] rounded-full flex items-center justify-center">
              <span className="text-sm text-white font-medium">
                {ad?.[0]}{soyad?.[0]}
              </span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {ad} {soyad}
              </div>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link href="/bayi/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profilim
              </Link>
              <Link href="/bayi/ayarlar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Ayarlar
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 