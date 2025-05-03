'use client';

import Link from 'next/link';

export default function BayiFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-4 px-6 bayi-footer z-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 mb-2 md:mb-0">
          &copy; {currentYear} LastikBende - Bayi Portalı - Tüm hakları saklıdır.
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/bayi/yardim" 
            className="text-sm text-gray-600 hover:text-purple-600"
          >
            Yardım Merkezi
          </Link>
          <Link 
            href="/bayi/iletisim" 
            className="text-sm text-gray-600 hover:text-purple-600"
          >
            İletişim
          </Link>
          <Link 
            href="/bayi/gizlilik" 
            className="text-sm text-gray-600 hover:text-purple-600"
          >
            Gizlilik Politikası
          </Link>
        </div>
      </div>
    </footer>
  );
} 