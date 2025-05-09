'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function YoneticiLoginHeader() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 yonetici-header z-10 mt-0 pt-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <Image
              src="/logo.png"
              alt="LastikBende"
              width={32}
              height={32}
              className="rounded"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">LastikBende</span>
            <span className="text-sm text-gray-500">Yönetici Portalı</span>
          </div>
        </div>
        <div>
          <Link 
            href="/" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Ana Siteye Dön
          </Link>
        </div>
      </div>
    </header>
  );
} 