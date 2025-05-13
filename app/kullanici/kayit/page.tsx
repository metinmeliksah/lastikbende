'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegisterForm from '../giris/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-md mx-auto px-4 py-8">
        <RegisterForm isLogin={false} onToggle={() => {}} />
      </div>
    </div>
  );
} 