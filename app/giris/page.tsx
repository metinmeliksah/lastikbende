'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthForm from './components/AuthForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-md mx-auto px-4 py-8">
        <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
} 