'use client';

import { useState, useEffect } from 'react';
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
    phone: '',
    termsAccepted: false,
    marketingAccepted: false
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Eğer hiç rakam yoksa boş döndür
    if (numbers.length === 0) return '';
    
    // İlk rakam 5 değilse hata ver
    if (numbers.length === 1 && numbers[0] !== '5') {
      setError('Telefon numarası 5 ile başlamalıdır');
      return '';
    }
    
    // İlk 3 rakamdan sonra boşluk ekle
    if (numbers.length <= 3) return numbers;
    
    // İlk 6 rakamdan sonra ikinci boşluk ekle
    if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    
    // Son 4 rakam için son boşluk ekle
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setError('');

    // Eğer input boşsa direkt olarak ayarla
    if (input === '') {
      setFormData(prev => ({ ...prev, phone: '' }));
      return;
    }

    // Sadece rakamları al
    const numbers = input.replace(/\D/g, '');
    
    // Eğer 10'dan fazla rakam varsa, sadece ilk 10 rakamı al
    const limitedNumbers = numbers.slice(0, 10);
    
    // Formatlanmış değeri ayarla
    const formattedValue = formatPhoneNumber(limitedNumbers);
    setFormData(prev => ({ ...prev, phone: formattedValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Ad ve soyad için sadece harf kontrolü
    if (name === 'firstName' || name === 'lastName') {
      // Sadece harfleri ve boşlukları kabul et
      const onlyLetters = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyLetters }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Üyelik sözleşmesi kontrolü
    if (!isLogin && !formData.termsAccepted) {
      setError('Üyelik sözleşmesini kabul etmelisiniz');
      return;
    }

    // Şifre kontrolü sadece üye olma kısmında
    if (!isLogin) {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      
      if (!hasUpperCase) {
        setError('Şifreniz en az 1 büyük harf içermelidir');
        return;
      }
      
      if (!hasNumber) {
        setError('Şifreniz en az 1 rakam içermelidir');
        return;
      }
    }

    // Telefon numarası kontrolü
    if (!isLogin && formData.phone) {
      const numbers = formData.phone.replace(/\D/g, '');
      if (numbers.length !== 10) {
        setError('Geçerli bir telefon numarası giriniz');
        return;
      }
      if (numbers[0] !== '5') {
        setError('Telefon numarası 5 ile başlamalıdır');
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone ? '+90 ' + formData.phone.replace(/\s/g, '') : ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      router.push('/kullanici');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
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
                  pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
                  title="Lütfen sadece harf giriniz"
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
                  pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
                  title="Lütfen sadece harf giriniz"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefon
              </label>
              <div className="flex">
                <div className="flex items-center px-3 bg-dark-100 rounded-l-md border border-dark-100 text-gray-400">
                  +90
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="5XX XXX XXXX"
                  className="w-full rounded-r-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
                  required={!isLogin}
                  maxLength={12}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Telefon numarası 5 ile başlamalıdır</p>
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary pr-10"
              required
              minLength={isLogin ? 1 : 8}
              maxLength={64}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
          {!isLogin && (
            <p className="mt-1 text-xs text-gray-400">
              Şifreniz en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf ve 1 rakam içermelidir.
            </p>
          )}
        </div>

        {!isLogin && (
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="h-4 w-4 rounded border-dark-100 text-primary focus:ring-primary"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="text-gray-400">
                  <a href="/uyelik-sozlesmesi" className="text-primary hover:text-red-500" target="_blank">
                    Üyelik Sözleşmesi
                  </a>
                  'ni okudum ve kabul ediyorum.
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="marketingAccepted"
                  checked={formData.marketingAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketingAccepted: e.target.checked }))}
                  className="h-4 w-4 rounded border-dark-100 text-primary focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="text-gray-400">
                  LastikBende'nin bana özel sunduğu kampanya ve fırsatlardan haberdar olmak istiyorum.
                </label>
              </div>
            </div>
          </div>
        )}

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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Yardıma mı ihtiyacın var?
          <br />
          <a href="tel:08504440044" className="text-primary hover:text-red-500">
            0850 444 0044
          </a>{' '}
          numarası üzerinden Müşteri Hizmetleri'ni arayabilirsin.
        </p>
      </div>
    </motion.div>
  );
} 