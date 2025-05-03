'use client';

import Link from 'next/link';

export default function YoneticiLoginFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-4 px-6 yonetici-footer">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-sm text-gray-500">
          &copy; {currentYear} LastikBende - Yönetici Portalı - Tüm hakları saklıdır.
        </div>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/yardim" className="text-sm text-gray-600 hover:text-blue-600">
            Yardım
          </Link>
          <Link href="/gizlilik" className="text-sm text-gray-600 hover:text-blue-600">
            Gizlilik
          </Link>
          <Link href="/iletisim" className="text-sm text-gray-600 hover:text-blue-600">
            İletişim
          </Link>
        </div>
      </div>
    </footer>
  );
} 