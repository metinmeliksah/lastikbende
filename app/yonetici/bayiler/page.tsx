'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Search, UserPlus, Phone, Mail, MapPin, Calendar, Eye, Edit, AlertCircle, Check, X, Users, Plus, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Seller {
  id: number;
  isim: string;
  telefon: string;
  email: string;
  adres: string;
  sehir: string;
  ilce: string;
  vergi_no: string;
  vergi_dairesi: string;
  created_at: string;
  updated_at: string;
  durum: boolean;
}

interface SellerDB {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  email: string;
  city: string;
  created_at: string;
  status: boolean;
}

interface Manager {
  id: number;
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  bayi_id: number;
  durum: boolean;
}

export default function Bayiler() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManagersModalOpen, setIsManagersModalOpen] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [editForm, setEditForm] = useState<Seller | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          id,
          isim,
          telefon,
          email,
          adres,
          sehir,
          ilce,
          vergi_no,
          vergi_dairesi,
          created_at,
          updated_at,
          durum
        `)
        .order('id', { ascending: true });

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Bayiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sellerId: number, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ durum: newStatus, updated_at: new Date().toISOString() })
        .eq('id', sellerId);

      if (error) throw error;
      await fetchSellers();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    // Validate phone number
    if (!isValidPhoneNumber(editForm.telefon)) {
      alert('Telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
      return;
    }

    // Validate email
    if (!isValidEmail(editForm.email)) {
      alert('Geçerli bir email adresi giriniz.');
      return;
    }

    // Validate other fields
    if (!editForm.isim.trim() || !editForm.adres.trim() || !editForm.sehir.trim() || !editForm.ilce.trim() || !editForm.vergi_no.trim() || !editForm.vergi_dairesi.trim()) {
      alert('Lütfen tüm alanları doldurunuz.');
      return;
    }

    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          isim: editForm.isim.trim(),
          telefon: editForm.telefon.replace(/\D/g, ''),
          email: editForm.email,
          adres: editForm.adres.trim(),
          sehir: editForm.sehir.trim(),
          ilce: editForm.ilce.trim(),
          vergi_no: editForm.vergi_no.trim(),
          vergi_dairesi: editForm.vergi_dairesi.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editForm.id);

      if (error) throw error;

      await fetchSellers();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Bayi güncellenirken hata:', error);
    }
  };

  const fetchManagers = async (bayiId: number) => {
    try {
      const { data, error } = await supabase
        .from('seller_managers')
        .select('*')
        .eq('bayi_id', bayiId);

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Yetkililer yüklenirken hata:', error);
      alert('Yetkililer yüklenirken bir hata oluştu.');
    }
  };

  const handleManagerStatusChange = async (managerId: number, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('seller_managers')
        .update({ durum: newStatus })
        .eq('id', managerId);

      if (error) throw error;
      
      // Yöneticileri yeniden yükle
      if (selectedSeller) {
        fetchManagers(selectedSeller.id);
      }
    } catch (error) {
      console.error('Yetkili durumu güncellenirken hata:', error);
      alert('Yetkili durumu güncellenirken bir hata oluştu.');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it starts with 90, if not add it
    const withCountry = cleaned.startsWith('90') ? cleaned : '90' + cleaned;
    // Format as +90 XXX XXX XXXX
    return `+${withCountry.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`;
  };

  // Format phone number for input field
  const formatPhoneInput = (phone: string) => {
    // Remove all non-numeric characters and the 90 prefix if exists
    const cleaned = phone.replace(/\D/g, '').replace(/^90/, '');
    
    // Format the remaining numbers
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return cleaned.replace(/(\d{3})/, '$1 ');
    } else if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})/, '$1 $2 ');
    }
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Phone number validation
  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^90\d{10}$/.test(cleaned);
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Arama ve filtreleme fonksiyonu
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.isim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.sehir.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && seller.durum;
    if (statusFilter === 'passive') return matchesSearch && !seller.durum;

    return matchesSearch;
  });

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bayiler</h1>
        <Link 
          href="/yonetici/bayiler/ekle"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5" />
          Yeni Bayi Ekle
        </Link>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Toplam Bayi</div>
          <div className="text-2xl font-bold text-gray-900">{sellers.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Aktif Bayi</div>
          <div className="text-2xl font-bold text-green-600">
            {sellers.filter(s => s.durum).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Pasif Bayi</div>
          <div className="text-2xl font-bold text-red-600">
            {sellers.filter(s => !s.durum).length}
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
              placeholder="Bayi ara..."
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

      {/* Bayiler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şehir
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Bayi bulunamadı
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{seller.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{seller.isim}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {formatPhoneNumber(seller.telefon)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {seller.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {seller.sehir}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(seller.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.durum ? 'Aktif' : 'Pasif'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                            Görüntüle
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setEditForm(seller);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors group relative"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                            Düzenle
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            fetchManagers(seller.id);
                            setIsManagersModalOpen(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group relative"
                        >
                          <Users className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                            Yetkililer
                          </span>
                        </button>
                        {seller.durum ? (
                          <button
                            onClick={() => handleStatusChange(seller.id, false)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                          >
                            <Ban className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                              Askıya Al
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(seller.id, true)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
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
      </div>

      {/* Görüntüleme Modalı */}
      {isViewModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Bayi Detayları</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID Bilgisi</label>
                  <div className="mt-1 text-sm text-gray-900">#{selectedSeller.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Firma Adı</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.isim}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Telefon Numarası</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.telefon}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Adresi</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.email}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Adres</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.adres}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Şehir</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.sehir}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">İlçe</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.ilce}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Vergi Numarası</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.vergi_no}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Vergi Dairesi</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedSeller.vergi_dairesi}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bayi Kayıt Tarihi</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedSeller.created_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Son Güncelleme Tarihi</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedSeller.updated_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Durum</label>
                  <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSeller.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSeller.durum ? 'Aktif' : 'Pasif'}
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
              <h2 className="text-xl font-bold text-gray-900">Bayi Düzenle</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Firma Adı</label>
                  <input
                    type="text"
                    value={editForm.isim}
                    onChange={(e) => setEditForm({ ...editForm, isim: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +90
                    </span>
                    <input
                      type="text"
                      value={formatPhoneInput(editForm.telefon.replace(/^90/, ''))}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {  // Only allow 10 digits after +90
                          setEditForm({ ...editForm, telefon: '90' + value });
                        }
                      }}
                      placeholder="XXX XXX XXXX"
                      className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Adresi</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      editForm.email && !isValidEmail(editForm.email)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                    required
                    pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    title="Lütfen geçerli bir email adresi giriniz"
                  />
                  {editForm.email && !isValidEmail(editForm.email) && (
                    <p className="mt-1 text-sm text-red-600">
                      Lütfen geçerli bir email adresi giriniz
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Adres</label>
                  <textarea
                    value={editForm.adres}
                    onChange={(e) => setEditForm({ ...editForm, adres: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şehir</label>
                  <input
                    type="text"
                    value={editForm.sehir}
                    onChange={(e) => setEditForm({ ...editForm, sehir: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlçe</label>
                  <input
                    type="text"
                    value={editForm.ilce}
                    onChange={(e) => setEditForm({ ...editForm, ilce: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                  <input
                    type="text"
                    value={editForm.vergi_no}
                    onChange={(e) => setEditForm({ ...editForm, vergi_no: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                  <input
                    type="text"
                    value={editForm.vergi_dairesi}
                    onChange={(e) => setEditForm({ ...editForm, vergi_dairesi: e.target.value })}
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

      {/* Managers Modal */}
      {isManagersModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedSeller.isim} - Yetkililer
                </h2>
                <button
                  onClick={() => setIsManagersModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <Link
                  href={`/yonetici/bayiler/yetkili-ekle/${selectedSeller.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Yetkili Ekle
                </Link>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad Soyad
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.map((manager) => (
                    <tr key={manager.id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {manager.ad} {manager.soyad}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {formatPhoneNumber(manager.telefon)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {manager.email}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          manager.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {manager.durum ? 'Aktif' : 'Pasif'}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/yonetici/bayiler/yetkili-duzenle/${manager.id}`}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {manager.durum ? (
                            <button
                              onClick={() => handleManagerStatusChange(manager.id, false)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleManagerStatusChange(manager.id, true)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 