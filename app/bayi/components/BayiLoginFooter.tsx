'use client';

import Link from 'next/link';

export default function BayiLoginFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-4 px-6 border-t bayi-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-2 md:mb-0">
          &copy; {currentYear} LastikBende - Tüm hakları saklıdır.
        </div>
        <div className="flex space-x-6">
          <Link 
            href="/yardim" 
            className="hover:text-purple-600"
          >
            Yardım
          </Link>
          <Link 
            href="/gizlilik" 
            className="hover:text-purple-600"
          >
            Gizlilik Politikası
          </Link>
          <Link 
            href="/iletisim" 
            className="hover:text-purple-600"
          >
            İletişim
          </Link>
        </div>
      </div>
    </footer>
  );
} 