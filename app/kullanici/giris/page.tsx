'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthForm from './components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-md mx-auto px-4 py-8">
        <AuthForm isLogin={true} onToggle={() => {}} />
      </div>
    </div>
  );
}