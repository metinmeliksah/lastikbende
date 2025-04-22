'use client';

import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

interface PersonalInfoFormProps {
  initialData: UserData;
  onDataChange: (data: UserData) => void;
}

export default function PersonalInfoForm({ initialData, onDataChange }: PersonalInfoFormProps) {
  const [userData, setUserData] = useState<UserData>(initialData);
  const [lastSavedData, setLastSavedData] = useState<UserData>(initialData);
  const [tempPhone, setTempPhone] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setUserData(initialData);
    setLastSavedData(initialData);
    if (initialData.phone) {
      const numbers = initialData.phone.replace(/\D/g, '');
      if (numbers.length >= 10) {
        setTempPhone(numbers.slice(2).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'));
      }
    }
    setError('');
  }, [initialData]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length === 1 && numbers[0] !== '5') {
      setError('Telefon numarası 5 ile başlamalıdır');
      return '';
    }
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setError('');

    if (input === '') {
      setTempPhone('');
      const newData = { ...userData, phone: '' };
      setUserData(newData);
      onDataChange(newData);
      return;
    }

    const numbers = input.replace(/\D/g, '');
    const limitedNumbers = numbers.slice(0, 10);
    const formattedValue = formatPhoneNumber(limitedNumbers);
    setTempPhone(formattedValue);
    
    if (formattedValue) {
      const newData = { ...userData, phone: '+90' + formattedValue.replace(/\s/g, '') };
      setUserData(newData);
      onDataChange(newData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...userData, [name]: value };
    setUserData(newData);
    onDataChange(newData);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === 'phone' && !tempPhone) {
      setUserData(prev => ({ ...prev, phone: lastSavedData.phone }));
      setTempPhone(lastSavedData.phone.slice(3).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'));
    } else if (name === 'name' && !userData.name) {
      setUserData(prev => ({ ...prev, name: lastSavedData.name }));
    } else if (name === 'surname' && !userData.surname) {
      setUserData(prev => ({ ...prev, surname: lastSavedData.surname }));
    } else if (name === 'email' && !userData.email) {
      setUserData(prev => ({ ...prev, email: lastSavedData.email }));
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    if (input.name === 'phone') {
      setTempPhone('');
    } else {
      input.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-4">Profil Resmi</h4>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-dark-300 border border-dark-100 flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {userData.name.charAt(0)}{userData.surname.charAt(0)}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-1 cursor-pointer transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-300">Profil resminizi güncelleyin</p>
            <p className="text-xs text-gray-400">PNG, JPG veya GIF (max. 2MB)</p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-4">Kişisel Bilgiler</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ad</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onClick={handleInputClick}
              placeholder={lastSavedData.name}
              className="block w-full px-3 py-2 rounded-md border border-dark-100 bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Soyad</label>
            <input
              type="text"
              name="surname"
              value={userData.surname}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onClick={handleInputClick}
              placeholder={lastSavedData.surname}
              className="block w-full px-3 py-2 rounded-md border border-dark-100 bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-posta Adresi</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onClick={handleInputClick}
              placeholder={lastSavedData.email}
              className="block w-full px-3 py-2 rounded-md border border-dark-100 bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Telefon Numarası</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-dark-100 bg-dark-300 text-gray-300 text-sm">
                +90
              </span>
              <input
                type="tel"
                name="phone"
                value={tempPhone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                onClick={handleInputClick}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-dark-100 bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={lastSavedData.phone ? lastSavedData.phone.slice(3).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : '5XX XXX XXXX'}
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 