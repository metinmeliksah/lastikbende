'use client';

import { useState, useEffect } from 'react';
import UserProfile from './components/UserProfile';
import OrderList from './components/OrderList';
import SettingsForm from './components/SettingsForm';
import DashboardTabs from './components/DashboardTabs';
import SupportTickets from './components/SupportTickets';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface UserData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  orders: number;
  memberSince: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  profileImageUrl: string;
}

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  orders_count: number | null;
  marketing_emails: boolean | null;
}

interface PreferencesData {
  email_notifications: boolean | null;
  sms_notifications: boolean | null;
}

// Özel bildirim bileşeni
const CustomToast = ({ message, type = 'success' }: { message: string | React.ReactNode; type?: 'success' | 'error' | 'info' }) => {
  const icons = {
    success: <FiCheckCircle className="text-green-500 mr-2" />,
    error: <FiAlertCircle className="text-red-500 mr-2" />,
    info: <FiInfo className="text-blue-500 mr-2" />
  };

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
      'bg-blue-50 text-blue-800 border border-blue-200'
    }`}>
      {icons[type]}
      {typeof message === 'string' ? (
        <span className="font-medium">{message}</span>
      ) : (
        <div className="font-medium">{message}</div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    orders: 0,
    memberSince: '',
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    profileImageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Kullanıcı verilerini yükle
  useEffect(() => {
    let isSubscribed = true;

    const fetchUserData = async () => {
      if (!isSubscribed) return;
      
      try {
        setIsLoading(true);
        
        // Oturum bilgilerini al
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('Kullanıcı oturumu bulunamadı');
          return;
        }
        
        // Kullanıcı profil bilgilerini al
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Profil bilgileri alınamadı:', profileError);
          return;
        }
        
        // Kullanıcı tercihlerini al
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (preferencesError && preferencesError.code !== 'PGRST116') {
          console.error('Kullanıcı tercihleri alınamadı:', preferencesError);
        }
        
        if (isSubscribed) {
          // Kullanıcı verilerini güncelle
          setUserData({
            name: String(profileData?.first_name || ''),
            surname: String(profileData?.last_name || ''),
            email: String(session.user.email || ''),
            phone: String(profileData?.phone || ''),
            orders: Number(profileData?.orders_count || 0),
            memberSince: new Date(session.user.created_at).getFullYear().toString(),
            emailNotifications: preferencesData?.email_notification === null ? true : preferencesData?.email_notification === true,
            smsNotifications: preferencesData?.sms_notification === null ? true : preferencesData?.sms_notification === true,
            marketingEmails: profileData?.marketing_accepted === null ? false : profileData?.marketing_accepted === true,
            profileImageUrl: typeof profileData?.profile_image_url === 'string' ? profileData.profile_image_url : ''
          });
          
          // Debug için konsola yazdır
          console.log('Profil verileri:', profileData);
          console.log('Marketing accepted değeri:', profileData?.marketing_accepted);
          console.log('Marketing emails değeri:', profileData?.marketing_accepted === null ? false : profileData?.marketing_accepted === true);
        }
        
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata oluştu:', error);
        if (isSubscribed) {
          toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu');
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isSubscribed) return;
      
      if (event === 'SIGNED_OUT') {
        // Kullanıcı çıkış yaptığında verileri sıfırla
        setUserData({
          name: '',
          surname: '',
          email: '',
          phone: '',
          orders: 0,
          memberSince: '',
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
          profileImageUrl: ''
        });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Kullanıcı giriş yaptığında veya token yenilendiğinde verileri güncelle
        fetchUserData();
      }
    });
    
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    fetchUser();
  }, [supabase]);

  const orders = [
    {
      id: 1,
      date: '12 Mart 2024',
      status: 'Tamamlandı',
      total: '₺1,299.99',
      items: [
        { name: 'Lastik 1', quantity: 2, price: '₺599.99' },
        { name: 'Jant 1', quantity: 1, price: '₺100.00' }
      ]
    },
    {
      id: 2,
      date: '10 Mart 2024',
      status: 'Kargoda',
      total: '₺899.99',
      items: [
        { name: 'Lastik 2', quantity: 1, price: '₺899.99' }
      ]
    },
    {
      id: 3,
      date: '5 Mart 2024',
      status: 'İşleme Alındı',
      total: '₺1,599.99',
      items: [
        { name: 'Lastik 3', quantity: 4, price: '₺399.99' }
      ]
    }
  ];

  const handleSaveSettings = async (data: { 
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
  }) => {
    try {
      // Oturum bilgilerini al
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.custom((t) => (
          <CustomToast 
            message="Kullanıcı oturumu bulunamadı" 
            type="error" 
          />
        ), { duration: 5000 });
        return;
      }

      let hasError = false;
      let errorMessage = '';
      let updateTypes: string[] = [];
      
      // Şifre değişikliği varsa
      if (data.currentPassword && data.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword
        });

        if (passwordError) {
          console.error('Şifre güncellenirken hata oluştu:', passwordError);
          hasError = true;
          errorMessage = 'Şifre güncellenirken bir hata oluştu';
          return;
        } else {
          updateTypes.push('şifre');
        }
      }
      
      // Profil fotoğrafı yükleme işlemi
      let profileImageUrl = null;
      if (data.profileImage) {
        const fileExt = data.profileImage.name.split('.').pop();
        const filePath = `${session.user.id}/profile.${fileExt}`;
        
        // Önce eski fotoğrafı sil
        const { data: oldImage } = await supabase.storage
          .from('profiles')
          .list(session.user.id);
          
        if (oldImage && oldImage.length > 0) {
          await supabase.storage
            .from('profiles')
            .remove(oldImage.map(file => `${session.user.id}/${file.name}`));
        }
        
        // Yeni fotoğrafı yükle
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.profileImage, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Profil fotoğrafı yüklenirken hata oluştu:', uploadError);
          hasError = true;
          errorMessage = 'Profil fotoğrafı yüklenirken bir hata oluştu';
        } else {
          // Yüklenen fotoğrafın URL'sini al
          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
          profileImageUrl = publicUrl;
          updateTypes.push('profil fotoğrafı');
        }
      }
      
      // Profil bilgilerini güncelle
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.name,
          last_name: data.surname,
          marketing_accepted: data.marketingEmails,
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single();
        
      if (profileError) {
        console.error('Profil güncellenirken hata oluştu:', profileError);
        hasError = true;
        errorMessage = 'Profil bilgileri güncellenirken bir hata oluştu';
      } else if (!updatedProfile) {
        console.error('Profil güncellenemedi');
        hasError = true;
        errorMessage = 'Profil bilgileri güncellenemedi';
      } else {
        // Hangi profil bilgilerinin güncellendiğini kontrol et
        if (data.name !== userData.name || data.surname !== userData.surname) {
          updateTypes.push('ad ve soyad');
        }
        if (data.marketingEmails !== userData.marketingEmails) {
          updateTypes.push('pazarlama e-postaları tercihi');
        }
        
        // Debug için konsola yazdır
        console.log('Güncellenen profil verileri:', updatedProfile);
        console.log('Marketing accepted değeri:', updatedProfile?.marketing_accepted);
        console.log('Marketing emails değeri:', data.marketingEmails);
      }

      // İletişim tercihlerini güncelle
      const { data: updatedPreferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          id: session.user.id,
          email_notifications: data.emailNotifications,
          sms_notifications: data.smsNotifications,
          phone_call: false, // Varsayılan olarak false
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (preferencesError) {
        console.error('İletişim tercihleri güncellenirken hata oluştu:', preferencesError);
        hasError = true;
        errorMessage = 'İletişim tercihleri güncellenirken bir hata oluştu';
      } else if (!updatedPreferences) {
        console.error('İletişim tercihleri güncellenemedi');
        hasError = true;
        errorMessage = 'İletişim tercihleri güncellenemedi';
      } else {
        // Hangi tercihlerin güncellendiğini kontrol et
        if (data.emailNotifications !== userData.emailNotifications) {
          updateTypes.push('e-posta bildirimleri');
        }
        if (data.smsNotifications !== userData.smsNotifications) {
          updateTypes.push('SMS bildirimleri');
        }
        if (data.marketingEmails !== userData.marketingEmails) {
          updateTypes.push('pazarlama e-postaları tercihi');
        }

        // State'i güncelle
        setUserData(prev => ({
          ...prev,
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
          marketingEmails: data.marketingEmails,
          profileImageUrl: profileImageUrl ? String(profileImageUrl) : prev.profileImageUrl
        }));
      }

      if (hasError) {
        toast.custom((t) => (
          <CustomToast 
            message={errorMessage} 
            type="error" 
          />
        ), { duration: 5000 });
        return;
      }

      // Güncellenmiş verileri kontrol et
      const isProfileUpdated = updatedProfile && 
        updatedProfile.first_name === data.name &&
        updatedProfile.last_name === data.surname &&
        updatedProfile.marketing_accepted === data.marketingEmails;

      const isPreferencesUpdated = updatedPreferences &&
        updatedPreferences.email_notifications === data.emailNotifications &&
        updatedPreferences.sms_notifications === data.smsNotifications;

      if (!isProfileUpdated || !isPreferencesUpdated) {
        console.error('Veriler doğru şekilde güncellenemedi');
        console.error('Beklenen email_notifications:', data.emailNotifications, 'Alınan:', updatedPreferences?.email_notifications);
        console.error('Beklenen sms_notifications:', data.smsNotifications, 'Alınan:', updatedPreferences?.sms_notifications);
        toast.custom((t) => (
          <CustomToast 
            message="Veriler güncellenirken bir hata oluştu" 
            type="error" 
          />
        ), { duration: 5000 });
        return;
      }
      
      // Güncellenen bilgileri içeren özel mesaj göster
      if (updateTypes.length > 0) {
        const updateMessage = updateTypes.join(', ');
        toast.custom((t) => (
          <CustomToast 
            message={`${updateMessage.charAt(0).toUpperCase() + updateMessage.slice(1)} başarıyla güncellendi`} 
            type="success" 
          />
        ), { duration: 5000 });
      } else {
        toast.custom((t) => (
          <CustomToast 
            message="Bilgileriniz başarıyla güncellendi" 
            type="success" 
          />
        ), { duration: 5000 });
      }
      
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      toast.custom((t) => (
        <CustomToast 
          message="Ayarlar kaydedilirken bir hata oluştu" 
          type="error" 
        />
      ), { duration: 5000 });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-dark-300 rounded-lg shadow-lg p-6 border border-dark-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
          <UserProfile 
            name={userData.name}
            surname={userData.surname}
            email={userData.email}
                profileImageUrl={userData.profileImageUrl}
          />
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-6">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-4 text-gray-100">Siparişlerim</h3>
                  <OrderList orders={orders} />
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                      {userId ? (
                        <SupportTickets userId={userId} />
                      ) : (
                        <div className="text-gray-400">Yükleniyor...</div>
                      )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
                  <h3 className="font-semibold mb-4 text-gray-100">Hesap Ayarları</h3>
                  <SettingsForm 
                    initialData={{
                      name: userData.name,
                      surname: userData.surname,
                      email: userData.email,
                      phone: userData.phone
                    }}
                    onSave={handleSaveSettings}
                    onCancel={() => {}}
                  />
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 