import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-400 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-400 mb-8">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all duration-300"
        >
          <FaHome className="text-lg" />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
} 