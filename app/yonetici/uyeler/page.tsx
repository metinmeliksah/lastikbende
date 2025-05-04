'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Search, Phone, Mail, Calendar, Eye, Edit, Ban, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_image_url: string | null;
  created_at: string;
  last_login: string;
  durum: boolean;
}

export default function Uyeler() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          email,
          profile_image_url,
          created_at,
          last_login,
          durum
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Üyeler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ durum: newStatus })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      
      toast.success(
        newStatus 
          ? 'Üye başarıyla aktifleştirildi.' 
          : 'Üye başarıyla askıya alındı.'
      );
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      toast.error('Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
        })
        .eq('id', editForm.id);

      if (error) throw error;

      await fetchUsers();
      setIsEditModalOpen(false);
      toast.success('Üye bilgileri başarıyla güncellendi.');
    } catch (error) {
      console.error('Üye güncellenirken hata:', error);
      toast.error('Üye güncellenirken bir hata oluştu.');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const withCountry = cleaned.startsWith('90') ? cleaned : '90' + cleaned;
    return `+${withCountry.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`;
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && user.durum;
    if (statusFilter === 'passive') return matchesSearch && !user.durum;

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" expand={true} richColors />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Üyeler</h1>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Toplam Üye</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Aktif Üye</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.durum).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Pasif Üye</div>
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => !u.durum).length}
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Üye ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter('passive')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'passive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pasif
            </button>
          </div>
        </div>
      </div>

      {/* Üyeler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profil
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İletişim
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Giriş
              </th>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Üye bulunamadı
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    {user.profile_image_url ? (
                      <Image
                        src={user.profile_image_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{formatPhoneNumber(user.phone)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(user.last_login)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.durum ? 'Aktif' : 'Pasif'}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                          Görüntüle
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditForm(user);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors group relative"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                          Düzenle
                        </span>
                      </button>
                      {user.durum ? (
                        <button
                          onClick={() => handleStatusChange(user.id, false)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                        >
                          <Ban className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                            Askıya Al
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, true)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                            Aktifleştir
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Görüntüleme Modalı */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Üye Detayları</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                {selectedUser.profile_image_url ? (
                  <Image
                    src={selectedUser.profile_image_url}
                    alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                    {getInitials(selectedUser.first_name, selectedUser.last_name)}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ad</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedUser.first_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Soyad</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedUser.last_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Telefon</label>
                  <div className="mt-1 text-sm text-gray-900">{formatPhoneNumber(selectedUser.phone)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Son Giriş</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.last_login)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Durum</label>
                  <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.durum ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Üye Düzenle</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +90
                    </span>
                    <input
                      type="text"
                      value={editForm.phone.replace(/^90/, '')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setEditForm({ ...editForm, phone: '90' + value });
                        }
                      }}
                      placeholder="XXX XXX XXXX"
                      className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 