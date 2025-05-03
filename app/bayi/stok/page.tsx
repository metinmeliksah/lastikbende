'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BarChart4
} from 'lucide-react';
import Link from 'next/link';

interface StokItem {
  id: number;
  urunAdi: string;
  kategori: 'Lastik' | 'Jant' | 'Aksesuar';
  stok: number;
  kritikSeviye: number;
  sonGuncelleme: string;
  sonHareket?: string;
  durum: 'Kritik' | 'Normal' | 'Fazla';
}

// Renk fonksiyonu
const getDurumClass = (durum: string) => {
  switch (durum) {
    case 'Kritik':
      return 'bg-red-100 text-red-700';
    case 'Normal':
      return 'bg-green-100 text-green-700';
    case 'Fazla':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function StokYonetimi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreKategori, setFiltreKategori] = useState<string>('Tümü');
  const [siralama, setSiralama] = useState<{alan: string, yon: 'asc' | 'desc'}>({
    alan: 'urunAdi',
    yon: 'asc'
  });

  // Örnek stok verileri
  const [stokItems, setStokItems] = useState<StokItem[]>([
    { id: 1, urunAdi: 'Michelin Primacy 4 205/55 R16', kategori: 'Lastik', stok: 24, kritikSeviye: 10, sonGuncelleme: '10.05.2023', sonHareket: '2 gün önce', durum: 'Normal' },
    { id: 2, urunAdi: 'Bridgestone Turanza T005 225/45 R17', kategori: 'Lastik', stok: 18, kritikSeviye: 15, sonGuncelleme: '08.05.2023', sonHareket: '1 gün önce', durum: 'Normal' },
    { id: 3, urunAdi: 'Continental WinterContact TS 870 195/65 R15', kategori: 'Lastik', stok: 8, kritikSeviye: 10, sonGuncelleme: '12.05.2023', sonHareket: 'Bugün', durum: 'Kritik' },
    { id: 4, urunAdi: 'OZ Racing Formula HLT 7.5x17"', kategori: 'Jant', stok: 6, kritikSeviye: 5, sonGuncelleme: '05.05.2023', sonHareket: '4 gün önce', durum: 'Normal' },
    { id: 5, urunAdi: 'BBS SR 8x18"', kategori: 'Jant', stok: 3, kritikSeviye: 5, sonGuncelleme: '02.05.2023', sonHareket: '1 hafta önce', durum: 'Kritik' },
    { id: 6, urunAdi: 'Goodyear EfficientGrip Performance 2 215/55 R17', kategori: 'Lastik', stok: 15, kritikSeviye: 10, sonGuncelleme: '09.05.2023', sonHareket: '3 gün önce', durum: 'Normal' },
    { id: 7, urunAdi: 'Pirelli Cinturato P7 225/50 R17', kategori: 'Lastik', stok: 20, kritikSeviye: 10, sonGuncelleme: '07.05.2023', sonHareket: '5 gün önce', durum: 'Normal' },
    { id: 8, urunAdi: 'Momo Revenge 7.5x17"', kategori: 'Jant', stok: 9, kritikSeviye: 5, sonGuncelleme: '01.05.2023', sonHareket: '2 hafta önce', durum: 'Normal' },
    { id: 9, urunAdi: 'Michelin CrossClimate 2 215/60 R16', kategori: 'Lastik', stok: 12, kritikSeviye: 8, sonGuncelleme: '11.05.2023', sonHareket: 'Bugün', durum: 'Normal' },
    { id: 10, urunAdi: 'Hava Basınç Ölçer', kategori: 'Aksesuar', stok: 25, kritikSeviye: 5, sonGuncelleme: '03.05.2023', sonHareket: '1 ay önce', durum: 'Fazla' },
    { id: 11, urunAdi: 'Lastik Şişirme Pompası', kategori: 'Aksesuar', stok: 18, kritikSeviye: 8, sonGuncelleme: '25.04.2023', sonHareket: '3 hafta önce', durum: 'Normal' },
    { id: 12, urunAdi: 'Bridgestone Blizzak LM005 205/55 R16', kategori: 'Lastik', stok: 4, kritikSeviye: 10, sonGuncelleme: '14.05.2023', sonHareket: 'Bugün', durum: 'Kritik' },
  ]);

  // İstatistikler
  const kritikStokSayisi = stokItems.filter(item => item.durum === 'Kritik').length;
  const toplamUrun = stokItems.length;
  const toplamStok = stokItems.reduce((total, item) => total + item.stok, 0);

  // Filtreleme
  const filteredItems = stokItems.filter(item => {
    const searchMatch = item.urunAdi.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filtreKategori === 'Tümü' || item.kategori === filtreKategori;
    return searchMatch && categoryMatch;
  });

  // Sıralama
  const sortedItems = [...filteredItems].sort((a, b) => {
    const valA = a[siralama.alan as keyof StokItem];
    const valB = b[siralama.alan as keyof StokItem];
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return siralama.yon === 'asc' ? valA - valB : valB - valA;
    }
    
    const stringA = String(valA).toLowerCase();
    const stringB = String(valB).toLowerCase();
    
    return siralama.yon === 'asc' 
      ? stringA.localeCompare(stringB, 'tr') 
      : stringB.localeCompare(stringA, 'tr');
  });

  // Sıralama fonksiyonu
  const handleSort = (alan: string) => {
    setSiralama(prev => ({
      alan,
      yon: prev.alan === alan && prev.yon === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Stok güncelleme (örnek fonksiyon)
  const handleStokGuncelle = useCallback((id: number, yeniStok: number) => {
    if (!isNaN(yeniStok) && yeniStok >= 0) {
      setStokItems(prev => prev.map(item => {
        if (item.id === id) {
          const durum = yeniStok < item.kritikSeviye 
            ? 'Kritik' 
            : yeniStok > item.kritikSeviye * 2 
              ? 'Fazla' 
              : 'Normal';
          
          return { 
            ...item, 
            stok: yeniStok,
            sonGuncelleme: new Date().toLocaleDateString('tr'),
            sonHareket: 'Bugün',
            durum
          };
        }
        return item;
      }));
    }
  }, []);

  // Stok tablosunda input alanı için handler
  const handleStokInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    try {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 0) {
        // Input değişikliklerinde debounce uygula
        // Bu sayede her tuşa basıldığında değil, tuşa basma işlemi 
        // bittikten sonra güncelleme yap
        const debouncedUpdate = setTimeout(() => {
          handleStokGuncelle(id, value);
        }, 500);
        
        return () => clearTimeout(debouncedUpdate);
      }
    } catch (err) {
      console.error("Stok güncelleme hatası:", err);
    }
  }, [handleStokGuncelle]);

  return (
    <div className="space-y-6">
      {/* Başlık ve Üst Bölüm */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="bayi-page-title">Stok Yönetimi</h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filtreKategori}
            onChange={(e) => setFiltreKategori(e.target.value)}
          >
            <option value="Tümü">Tüm Kategoriler</option>
            <option value="Lastik">Lastik</option>
            <option value="Jant">Jant</option>
            <option value="Aksesuar">Aksesuar</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 text-gray-500" />
            <span>Dışa Aktar</span>
          </button>
          
          <Link 
            href="/bayi/stok/ekle"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Ürün</span>
          </Link>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toplam Ürün */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Ürün</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{toplamUrun}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <BarChart4 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {toplamUrun} farklı ürün stoklarınızda bulunmaktadır.
          </div>
        </div>

        {/* Toplam Stok */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Stok</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{toplamStok} Adet</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <ArrowUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Tüm ürünlerinizin toplam stok adedi
          </div>
        </div>

        {/* Kritik Stok */}
        <div className="bayi-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Kritik Stok</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kritikStokSayisi} Ürün</h3>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {kritikStokSayisi} ürünün stok seviyesi kritik seviyede
          </div>
        </div>
      </div>

      {/* Stok Tablosu */}
      <div className="bayi-card">
        <div className="w-full">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[5%]"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {siralama.alan === 'id' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[30%]"
                  onClick={() => handleSort('urunAdi')}
                >
                  <div className="flex items-center gap-1">
                    <span>Ürün Adı</span>
                    {siralama.alan === 'urunAdi' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[12%]"
                  onClick={() => handleSort('kategori')}
                >
                  <div className="flex items-center gap-1">
                    <span>Kategori</span>
                    {siralama.alan === 'kategori' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[12%]"
                  onClick={() => handleSort('stok')}
                >
                  <div className="flex items-center gap-1">
                    <span>Stok</span>
                    {siralama.alan === 'stok' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[12%]"
                  onClick={() => handleSort('durum')}
                >
                  <div className="flex items-center gap-1">
                    <span>Durum</span>
                    {siralama.alan === 'durum' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[16%]"
                  onClick={() => handleSort('sonGuncelleme')}
                >
                  <div className="flex items-center gap-1">
                    <span>Son Güncelleme</span>
                    {siralama.alan === 'sonGuncelleme' ? (
                      siralama.yon === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-medium text-gray-800 truncate">
                    #{item.id}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {item.urunAdi}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {item.kategori}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        className="w-14 px-2 py-1 border border-gray-300 rounded-md"
                        value={item.stok}
                        onChange={(e) => handleStokInputChange(e, item.id)}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            handleStokGuncelle(item.id, value);
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500">adet</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getDurumClass(item.durum)}`}>
                      {item.durum}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600">
                    <div>
                      <div className="truncate">{item.sonGuncelleme}</div>
                      {item.sonHareket && (
                        <div className="text-xs text-gray-500 truncate">Son: {item.sonHareket}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-xs"
                        onClick={() => {
                          const yeniStok = prompt(`${item.urunAdi} için yeni stok adedi giriniz:`, item.stok.toString());
                          if (yeniStok !== null) {
                            const stokAdedi = parseInt(yeniStok);
                            if (!isNaN(stokAdedi) && stokAdedi >= 0) {
                              handleStokGuncelle(item.id, stokAdedi);
                            }
                          }
                        }}
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablo Altı */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam <span className="font-medium">{filteredItems.length}</span> ürün gösteriliyor
          </div>
          
          <div className="flex gap-2">
            <Link 
              href="/bayi/raporlar/stok" 
              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium"
            >
              Stok Raporu Görüntüle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 