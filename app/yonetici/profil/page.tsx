'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Mail, Calendar } from 'lucide-react';

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilSayfasi() {
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState<Manager | null>(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // Oturum bilgilerini kontrol et
      const managerDataStr = localStorage.getItem('managerData');
      if (!managerDataStr) {
        console.error("Yönetici oturumu bulunamadı");
        window.location.href = '/yonetici/giris';
        return;
      }

      const managerData = JSON.parse(managerDataStr);
      const managerId = managerData.id;

      if (!managerId) {
        console.error("Yönetici ID bulunamadı");
        window.location.href = '/yonetici/giris';
        return;
      }

      // Yönetici bilgilerini getir
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('id', managerId)
        .single();

      if (error) throw error;

      if (data) {
        setManager(data);
      }
    } catch (error) {
      console.error('Yönetici bilgileri alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Profil bilgileri bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil Bilgilerim</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
            <span className="text-4xl font-semibold text-white">
              {getInitials(manager.first_name, manager.last_name)}
            </span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {manager.first_name} {manager.last_name}
              </h2>
              <div className="text-sm text-gray-600">{manager.position}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <div className="text-sm font-medium text-gray-900">{manager.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Kayıt Tarihi</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(manager.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Son Güncelleme</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(manager.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
