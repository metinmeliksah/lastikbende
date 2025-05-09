'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function BayiLoginHeader() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 bayi-header z-10 flex items-center">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center gap-3">
          <Image
            src="https://npqvsvfkmrrbbkxxkrpl.supabase.co/storage/v1/object/public/logo//ChatGPT%20Image%20May%205,%202025,%2001_08_12%20AM.png"
            alt="LastikBende"
            width={56}
            height={56}
            className="rounded"
            priority
          />
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Siteye Dön</span>
        </Link>
      </div>
    </header>
  );
} 