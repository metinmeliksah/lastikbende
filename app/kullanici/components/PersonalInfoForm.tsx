'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface UserData {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

interface PersonalInfoFormProps {
  formData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    profileImageUrl?: string;
  };
  errors?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageChange?: (file: File, oldImageUrl?: string) => void;
}

export default function PersonalInfoForm({ formData, errors = {}, onChange, onImageChange }: PersonalInfoFormProps) {
  const [userData, setUserData] = useState<UserData>(formData);
  const [lastSavedData, setLastSavedData] = useState<UserData>(formData);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(formData.profileImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setUserData(formData);
    setLastSavedData(formData);
    setError('');
    setPreviewImage(formData.profileImageUrl || null);
  }, [formData]);

  const formatPhoneNumber = (value: string) => {
    // +90 prefix'ini kaldır
    const withoutPrefix = value.replace('+90 ', '');
    // Sadece rakamları al
    const numbers = withoutPrefix.replace(/\D/g, '');
    
    // Formatlama
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    const event = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    } as ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...userData, [name]: value };
    setUserData(newData);
    onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === 'name' && !userData.name) {
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
      setUserData(prev => ({ ...prev, phone: '' }));
    } else {
      input.value = '';
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Dosya boyutu 2MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        setError('Sadece JPG, PNG veya GIF dosyaları yükleyebilirsiniz');
        return;
      }

      try {
        setIsUploading(true);
        setError('');

        // Önce yerel önizleme göster
        const localPreview = URL.createObjectURL(file);
        setPreviewImage(localPreview);

        // Cloudinary'ye yükle
        const imageUrl = await uploadToCloudinary(file, {
          folder: 'profile_images',
          transformation: [
            { 
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto',
              fetch_format: 'auto'
            }
          ]
        });
        
        if (!imageUrl) {
          throw new Error('Fotoğraf yüklenemedi');
        }

        // Cloudinary'den gelen URL'i kullan
        setPreviewImage(imageUrl);

        // Üst bileşene dosyayı ve eski URL'i ilet
        if (onImageChange) {
          onImageChange(file, formData.profileImageUrl);
        }
      } catch (error) {
        console.error('Profil fotoğrafı yüklenirken hata:', error);
        if (error instanceof Error) {
          setError(`Profil fotoğrafı yüklenirken bir hata oluştu: ${error.message}`);
        } else {
          setError('Profil fotoğrafı yüklenirken beklenmeyen bir hata oluştu');
        }
        // Hata durumunda önizlemeyi eski haline getir
        setPreviewImage(formData.profileImageUrl || null);
      } finally {
        setIsUploading(false);
      }
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
                <img 
                  src={previewImage} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                  onError={() => {
                    setPreviewImage(null);
                    setError('Profil fotoğrafı yüklenemedi');
                  }}
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {userData.name.charAt(0)}{userData.surname.charAt(0)}
                </span>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <label 
              className={`absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-1 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Profil fotoğrafı yükle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-300">Profil resminizi güncelleyin</p>
            <p className="text-xs text-gray-400">PNG, JPG veya GIF (max. 2MB)</p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
              className={`block w-full px-3 py-2 rounded-md border ${
                errors.name ? 'border-red-500' : 'border-dark-100'
              } bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
              className={`block w-full px-3 py-2 rounded-md border ${
                errors.surname ? 'border-red-500' : 'border-dark-100'
              } bg-dark-300 text-gray-100 placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.surname && <p className="mt-1 text-sm text-red-500">{errors.surname}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-posta Adresi</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              readOnly
              disabled
              className="block w-full px-3 py-2 rounded-md border border-dark-100 bg-dark-400 text-gray-400 cursor-not-allowed focus:outline-none"
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
                value={formatPhoneNumber(userData.phone)}
                readOnly
                disabled
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-dark-100 bg-dark-400 text-gray-400 cursor-not-allowed focus:outline-none"
                placeholder="5XX XXX XXXX"
              />
            </div>
            <p className="mt-1 text-xs text-primary">E-posta ve telefon bilgilerinizi değiştirmek için admin ile iletişime geçiniz</p>
          </div>
        </div>
      </div>
    </div>
  );
} 