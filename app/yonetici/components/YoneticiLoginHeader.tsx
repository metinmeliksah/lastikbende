'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function YoneticiLoginHeader() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 yonetici-header z-10 mt-0 pt-0">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="LastikBende"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-xl font-semibold text-gray-900">LastikBende Yönetici Portalı</span>
        </div>
        <div>
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Ana Siteye Dön
          </Link>
        </div>
      </div>
    </header>
  );
} 