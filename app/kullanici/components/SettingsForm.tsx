'use client';

import { useState, useEffect } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordChangeForm from './PasswordChangeForm';
import CommunicationPreferencesForm from './CommunicationPreferencesForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  profileImage?: string;
}

interface SettingsFormProps {
  initialData: UserData;
  onSave: (data: UserData) => void;
  onCancel: () => void;
}

export default function SettingsForm({ initialData, onSave, onCancel }: SettingsFormProps) {
  const [userData, setUserData] = useState<UserData>(initialData);
  const [lastSavedData, setLastSavedData] = useState<UserData>(initialData);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotification: false,
    smsNotification: false,
    phoneCall: false
  });
  const [error, setError] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isSurnameFocused, setIsSurnameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setLastSavedData(initialData);
    if (initialData.phone) {
      const numbers = initialData.phone.replace(/\D/g, '');
      if (numbers.length >= 10) {
        setTempPhone(numbers.slice(2).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'));
      }
    }
  }, [initialData]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length === 1 && numbers[0] !== '5') {
      setError('Telefon numarası 5 ile başlamalıdır');
      return '';
    }
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setError('');

    if (input === '') {
      setTempPhone('');
      setUserData(prev => ({ ...prev, phone: '' }));
      return;
    }

    const numbers = input.replace(/\D/g, '');
    const limitedNumbers = numbers.slice(0, 10);
    const formattedValue = formatPhoneNumber(limitedNumbers);
    setTempPhone(formattedValue);
    setUserData(prev => ({ ...prev, phone: '+90 ' + formattedValue.replace(/\s/g, '') }));
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validatePasswords = () => {
    if (passwords.new !== passwords.confirm) {
      setError('Yeni şifreler eşleşmiyor');
      return false;
    }

    if (passwords.new) {
      const hasUpperCase = /[A-Z]/.test(passwords.new);
      const hasNumber = /[0-9]/.test(passwords.new);
      
      if (!hasUpperCase) {
        setError('Şifreniz en az 1 büyük harf içermelidir');
        return false;
      }
      
      if (!hasNumber) {
        setError('Şifreniz en az 1 rakam içermelidir');
        return false;
      }

      if (passwords.new.length < 8) {
        setError('Şifreniz en az 8 karakter uzunluğunda olmalıdır');
        return false;
      }
    }

    return true;
  };

  const handleDataChange = (data: UserData) => {
    setUserData(data);
    setHasChanges(
      data.name !== lastSavedData.name ||
      data.surname !== lastSavedData.surname ||
      data.email !== lastSavedData.email ||
      data.phone !== lastSavedData.phone
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwords.new && !validatePasswords()) {
      return;
    }

    try {
      // Şifre değişikliği varsa
      if (passwords.new) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: passwords.new
        });

        if (passwordError) throw passwordError;
      }

      // Profil güncelleme
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.name,
          last_name: userData.surname,
          phone: userData.phone
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (profileError) throw profileError;

      // Tercihleri güncelle
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (preferencesError) throw preferencesError;

      onSave(userData);
      setLastSavedData(userData);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleCancel = () => {
    setUserData(lastSavedData);
    setTempPhone(lastSavedData.phone ? lastSavedData.phone.slice(3).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : '');
    
    setPasswords({
      current: '',
      new: '',
      confirm: ''
    });
    
    setError('');
    
    setHasChanges(false);

    setIsNameFocused(false);
    setIsSurnameFocused(false);
    setIsEmailFocused(false);
    setIsPhoneFocused(false);

    onCancel();
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    input.value = '';
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview için URL oluştur
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
      }

      // Supabase storage'a yükle
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Profili güncelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      setUserData(prev => ({ ...prev, profileImage: publicUrl }));
      setHasChanges(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resim yüklenirken bir hata oluştu');
      setPreviewImage(null);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      // Hesap silme işlemi burada yapılacak
      console.log('Hesap silme işlemi başlatıldı');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonalInfoForm
          initialData={userData}
          onDataChange={handleDataChange}
        />
        <div className="space-y-6">
          <PasswordChangeForm
            onPasswordChange={setPasswords}
          />
          <CommunicationPreferencesForm
            onPreferencesChange={setPreferences}
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-dark-100">
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="text-red-500 hover:text-red-400 text-sm font-medium"
        >
          Hesabı Sil
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </form>
  );
} 