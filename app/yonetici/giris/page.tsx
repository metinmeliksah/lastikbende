'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { signInManager } from '@/app/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function YoneticiGiris() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchLogo() {
      const { data, error } = await supabase
        .from('settings')
        .select('logo_url_yonetici')
        .single();

      if (!error && data?.logo_url_yonetici) {
        setLogoUrl(data.logo_url_yonetici);
      }
    }

    fetchLogo();
  }, [supabase]);

  // Zaten giriş yapmışsa yönetici paneline yönlendir
  useEffect(() => {
    const managerData = localStorage.getItem('managerData');
    if (managerData) {
      try {
        const data = JSON.parse(managerData);
        if (data && data.id) {
          router.push('/yonetici');
          return;
        }
      } catch (error) {
        localStorage.removeItem('managerData');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInManager(email, password);
      
      // signInManager'ın yeni formatını kontrol et
      if (result.data && !result.error) {
        // Başarılı giriş
        const managerData = {
          id: result.data.id,
          email: result.data.email,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          ad: result.data.ad,
          soyad: result.data.soyad,
          durum: result.data.durum,
          position: result.data.position,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at
        };
        
        localStorage.setItem('managerData', JSON.stringify(managerData));
        
        // Remember me seçeneği
        if (rememberMe) {
          localStorage.setItem('rememberManager', 'true');
        }
        
        // Yönlendirme
        router.push('/yonetici');
        router.refresh(); // Sayfayı yenile
      } else {
        // Hatalı giriş
        setError(result.error || 'Giriş yapılırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="LastikBende"
              width={130} 
              height={55}
              className="rounded-lg" 
            />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Giriş Paneli</h1>
        <p className="text-sm font-medium text-gray-700 mt-2">Yönetici hesabınıza giriş yapın</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start mb-6">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta Adresi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
              placeholder="admin@lastikbende.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="pl-10 pr-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Beni Hatırla
            </label>
          </div>
          <div className="text-sm">
            <Link href="/yonetici/sifremi-unuttum" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
              Şifremi Unuttum
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Giriş Yap
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center text-sm font-medium text-gray-700">
          Yönetici erişimi sadece yetkili kişilere açıktır.
        </div>
      </div>
    </div>
  );
} 