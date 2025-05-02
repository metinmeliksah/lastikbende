'use client';

import { useState } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordChangeForm from './PasswordChangeForm';
import CommunicationPreferencesForm from './CommunicationPreferencesForm';

interface SettingsFormProps {
  initialData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  };
  onSave: (data: {
  name: string;
  surname: string;
  email: string;
  phone: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    profileImage?: File;
    currentPassword?: string;
    newPassword?: string;
  }) => void;
  onCancel: () => void;
}

export default function SettingsForm({ initialData, onSave, onCancel }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    surname: initialData.surname,
    email: initialData.email,
    phone: initialData.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: initialData.emailNotifications ?? true,
    smsNotifications: initialData.smsNotifications ?? true,
    marketingEmails: initialData.marketingEmails ?? false
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Ad ve soyad kontrolü
    if (!formData.name.trim()) {
      newErrors.name = 'Ad alanı zorunludur';
      isValid = false;
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyad alanı zorunludur';
      isValid = false;
    }

    // Telefon kontrolü
    const phoneRegex = /^\+?[0-9\s-()]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon alanı zorunludur';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
      isValid = false;
    }

    // Şifre değişikliği kontrolü
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mevcut şifrenizi giriniz';
        isValid = false;
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Yeni şifrenizi giriniz';
        isValid = false;
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Şifre en az 6 karakter olmalıdır';
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Yeni şifrenizi tekrar giriniz';
        isValid = false;
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (file: File) => {
    setProfileImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setIsSuccess(false);
      
      try {
        await onSave({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          marketingEmails: formData.marketingEmails,
          profileImage: profileImage || undefined,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        });
        
        // Şifre alanlarını temizle
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (error) {
        console.error('Ayarlar kaydedilirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Checkbox değerlerini konsola yazdır
    if (type === 'checkbox') {
      console.log(`Checkbox değişti: ${name}, Yeni değer: ${checked}`);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Hata varsa temizle
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialData.name,
      surname: initialData.surname,
      email: initialData.email,
      phone: initialData.phone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      emailNotifications: initialData.emailNotifications ?? true,
      smsNotifications: initialData.smsNotifications ?? true,
      marketingEmails: initialData.marketingEmails ?? false
    });
    setProfileImage(null);
    setErrors({});
    setIsSuccess(false);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="mt-1 text-sm text-gray-400">
        Kişisel bilgilerinizi güncelleyin ve hesap tercihlerinizi yönetin.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
        <PersonalInfoForm
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            onImageChange={handleImageChange}
        />
        </div>
        
        <div className="space-y-6">
          <PasswordChangeForm
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
          
          <div className="border-t border-dark-200 pt-6">
          <CommunicationPreferencesForm
              formData={formData}
              onChange={handleInputChange}
          />
          </div>
        </div>
      </div>

      <div className="border-t border-dark-200 pt-6">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-dark-100 hover:bg-dark-200 rounded-md transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Güncelleniyor...
              </span>
            ) : (
              'Güncelle'
            )}
          </button>
        </div>
        
        {isSuccess && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-sm text-green-400">
              Ayarlarınız başarıyla kaydedildi.
            </p>
          </div>
        )}
      </div>
    </form>
  );
} 