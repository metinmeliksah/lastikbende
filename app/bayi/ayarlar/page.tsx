'use client';

import { useState } from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Key, 
  Bell,
  Lock,
  ShieldCheck,
  Save
} from 'lucide-react';

export default function AyarlarSayfasi() {
  const [activeTab, setActiveTab] = useState('profil');
  const [formData, setFormData] = useState({
    bayiAdi: 'İstanbul Lastik A.Ş.',
    yetkiliAdSoyad: 'Ahmet Yılmaz',
    telefon: '0212 555 44 33',
    email: 'ahmet.yilmaz@istanbullastik.com',
    adres: 'Ataşehir, İstanbul',
    webSite: 'www.istanbullastik.com',
    vergiDairesi: 'Ataşehir',
    vergiNo: '12345678901',
    mevcutSifre: '',
    yeniSifre: '',
    yeniSifreTekrar: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderiliyor:', formData);
    // API çağrısı burada yapılacak
    alert('Bilgileriniz başarıyla güncellendi!');
  };

  return (
    <div className="space-y-6">
      <h1 className="bayi-page-title">Ayarlar</h1>

      {/* Sekmeler */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'profil' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bayi Profili
          </button>
          <button 
            onClick={() => setActiveTab('guvenlik')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'guvenlik' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Güvenlik Ayarları
          </button>
          <button 
            onClick={() => setActiveTab('bildirimler')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'bildirimler' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bildirim Tercihleri
          </button>
        </nav>
      </div>

      {/* Profil Bilgileri */}
      {activeTab === 'profil' && (
        <div className="bayi-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Bayi Profil Bilgileri</h2>
            <p className="text-sm text-gray-500 mt-1">Temel bilgilerinizi güncelleyin</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bayi Adı */}
              <div>
                <label htmlFor="bayiAdi" className="block text-sm font-medium text-gray-700 mb-1">
                  Bayi Adı
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="bayiAdi"
                    name="bayiAdi"
                    value={formData.bayiAdi}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Yetkili Kişi */}
              <div>
                <label htmlFor="yetkiliAdSoyad" className="block text-sm font-medium text-gray-700 mb-1">
                  Yetkili Ad Soyad
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="yetkiliAdSoyad"
                    name="yetkiliAdSoyad"
                    value={formData.yetkiliAdSoyad}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Telefon */}
              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* E-posta */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Adres */}
              <div className="md:col-span-2">
                <label htmlFor="adres" className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="adres"
                    name="adres"
                    rows={2}
                    value={formData.adres}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Web Sitesi */}
              <div>
                <label htmlFor="webSite" className="block text-sm font-medium text-gray-700 mb-1">
                  Web Sitesi
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="webSite"
                    name="webSite"
                    value={formData.webSite}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Vergi Dairesi */}
              <div>
                <label htmlFor="vergiDairesi" className="block text-sm font-medium text-gray-700 mb-1">
                  Vergi Dairesi
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="vergiDairesi"
                    name="vergiDairesi"
                    value={formData.vergiDairesi}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Vergi No */}
              <div>
                <label htmlFor="vergiNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Vergi Numarası
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="vergiNo"
                    name="vergiNo"
                    value={formData.vergiNo}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Güvenlik Ayarları */}
      {activeTab === 'guvenlik' && (
        <div className="bayi-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Güvenlik Ayarları</h2>
            <p className="text-sm text-gray-500 mt-1">Şifre değiştirme ve güvenlik seçenekleri</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Mevcut Şifre */}
              <div>
                <label htmlFor="mevcutSifre" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="mevcutSifre"
                    name="mevcutSifre"
                    value={formData.mevcutSifre}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Yeni Şifre */}
              <div>
                <label htmlFor="yeniSifre" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="yeniSifre"
                    name="yeniSifre"
                    value={formData.yeniSifre}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
              
              {/* Yeni Şifre Tekrar */}
              <div>
                <label htmlFor="yeniSifreTekrar" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre Tekrar
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="yeniSifreTekrar"
                    name="yeniSifreTekrar"
                    value={formData.yeniSifreTekrar}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Şifreyi Güncelle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bildirim Tercihleri */}
      {activeTab === 'bildirimler' && (
        <div className="bayi-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Bildirim Tercihleri</h2>
            <p className="text-sm text-gray-500 mt-1">Hangi konularda bildirim almak istediğinizi seçin</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="bildirim1"
                    name="bildirim1"
                    type="checkbox"
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="bildirim1" className="font-medium text-gray-700">Yeni Siparişler</label>
                  <p className="text-gray-500">Yeni bir sipariş oluşturulduğunda bildirim al</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="bildirim2"
                    name="bildirim2"
                    type="checkbox"
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="bildirim2" className="font-medium text-gray-700">Stok Uyarıları</label>
                  <p className="text-gray-500">Ürünler kritik stok seviyesine geldiğinde bildirim al</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="bildirim3"
                    name="bildirim3"
                    type="checkbox"
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="bildirim3" className="font-medium text-gray-700">Fiyat Değişiklikleri</label>
                  <p className="text-gray-500">Ürün fiyatları değiştiğinde bildirim al</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="bildirim4"
                    name="bildirim4"
                    type="checkbox"
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="bildirim4" className="font-medium text-gray-700">Pazarlama Bildirimleri</label>
                  <p className="text-gray-500">Kampanyalar ve özel teklifler hakkında bildirim al</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Bell className="h-4 w-4 mr-2" />
                Bildirimleri Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 