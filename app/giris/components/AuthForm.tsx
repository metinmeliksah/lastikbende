'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ErrorMessage from './ErrorMessage';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
}

export default function AuthForm({ isLogin, onToggle }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      router.push('/uyelik');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-300 rounded-lg shadow-lg p-6 border border-dark-100"
    >
      <div className="flex justify-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          {isLogin ? 'Giriş Yap' : 'Üye Ol'}
        </h1>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ad
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Soyad
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
                  required={!isLogin}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 5XX XXX XXXX"
                className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
                required={!isLogin}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            E-posta
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Şifre
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          {isLogin ? 'Giriş Yap' : 'Üye Ol'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onToggle}
          className="text-primary hover:text-red-500 transition-colors"
        >
          {isLogin ? 'Hesabınız yok mu? Üye olun' : 'Zaten üye misiniz? Giriş yapın'}
        </button>
      </div>
    </motion.div>
  );
} 