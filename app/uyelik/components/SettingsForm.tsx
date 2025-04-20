'use client';

import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface SettingsFormProps {
  initialData: UserData;
  onSave: (data: UserData) => void;
  onCancel: () => void;
}

export default function SettingsForm({ initialData, onSave, onCancel }: SettingsFormProps) {
  const [userData, setUserData] = useState<UserData>(initialData);
  const [backupData, setBackupData] = useState<UserData>(initialData);

  useEffect(() => {
    setBackupData(initialData);
  }, [initialData]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    if (!formatted.startsWith('90')) {
      formatted = '90' + formatted;
    }
    if (formatted.length > 2) {
      formatted = formatted.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setUserData({...userData, phone: formatted});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData);
  };

  const handleCancel = () => {
    setUserData(backupData);
    onCancel();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Kişisel Bilgiler</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Ad Soyad</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">E-posta Adresi</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Telefon Numarası</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={handlePhoneChange}
                placeholder="+90 5XX XXX XXXX"
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
              <p className="mt-1 text-sm text-gray-400">Format: +90 5XX XXX XXXX</p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Şifre Değiştir</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Mevcut Şifre</label>
              <input
                type="password"
                placeholder="Mevcut şifrenizi girin"
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Yeni Şifre</label>
              <input
                type="password"
                placeholder="Yeni şifrenizi girin"
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                placeholder="Yeni şifrenizi tekrar girin"
                className="mt-1 block w-full rounded-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-dark-100 text-gray-100 px-6 py-2 rounded-md hover:bg-dark-200 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="bg-primary text-gray-100 px-6 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <span>Değişiklikleri Kaydet</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
} 