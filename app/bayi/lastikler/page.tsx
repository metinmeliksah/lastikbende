'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

interface Lastik {
  id: number;
  marka: string;
  model: string;
  ebat: string;
  yil: number;
  mevsim: 'Yaz' | 'Kış' | 'Dört Mevsim';
  stok: number;
  fiyat: number;
  indirimli?: number;
}

export default function LastikTablosu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [siralamaTuru, setSiralamaTuru] = useState('marka');
  const [siralamaDuzeni, setSiralamaDuzeni] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Örnek lastik verileri
  const [lastikler, setLastikler] = useState<Lastik[]>([
    { id: 1, marka: 'Michelin', model: 'Primacy 4', ebat: '205/55 R16', yil: 2023, mevsim: 'Yaz', stok: 24, fiyat: 2850 },
    { id: 2, marka: 'Bridgestone', model: 'Turanza T005', ebat: '225/45 R17', yil: 2023, mevsim: 'Yaz', stok: 18, fiyat: 3200 },
    { id: 3, marka: 'Continental', model: 'WinterContact TS 870', ebat: '195/65 R15', yil: 2023, mevsim: 'Kış', stok: 32, fiyat: 2400, indirimli: 2150 },
    { id: 4, marka: 'Goodyear', model: 'EfficientGrip Performance 2', ebat: '215/55 R17', yil: 2023, mevsim: 'Yaz', stok: 15, fiyat: 2950 },
    { id: 5, marka: 'Pirelli', model: 'Cinturato P7', ebat: '225/50 R17', yil: 2023, mevsim: 'Yaz', stok: 20, fiyat: 3100 },
    { id: 6, marka: 'Michelin', model: 'CrossClimate 2', ebat: '215/60 R16', yil: 2023, mevsim: 'Dört Mevsim', stok: 12, fiyat: 3050 },
    { id: 7, marka: 'Bridgestone', model: 'Blizzak LM005', ebat: '205/55 R16', yil: 2023, mevsim: 'Kış', stok: 28, fiyat: 2800 },
    { id: 8, marka: 'Continental', model: 'PremiumContact 6', ebat: '225/45 R18', yil: 2023, mevsim: 'Yaz', stok: 9, fiyat: 3750 },
    { id: 9, marka: 'Hankook', model: 'Ventus Prime4', ebat: '215/55 R16', yil: 2023, mevsim: 'Yaz', stok: 14, fiyat: 2400 },
    { id: 10, marka: 'Goodyear', model: 'UltraGrip 9+', ebat: '195/65 R15', yil: 2023, mevsim: 'Kış', stok: 22, fiyat: 2500 },
    { id: 11, marka: 'Pirelli', model: 'Winter Sottozero 3', ebat: '225/45 R17', yil: 2023, mevsim: 'Kış', stok: 17, fiyat: 3200 },
    { id: 12, marka: 'Michelin', model: 'Pilot Sport 4', ebat: '225/40 R18', yil: 2023, mevsim: 'Yaz', stok: 11, fiyat: 3900 },
    { id: 13, marka: 'Lassa', model: 'Driveways Sport', ebat: '205/55 R16', yil: 2023, mevsim: 'Yaz', stok: 19, fiyat: 2200 },
    { id: 14, marka: 'Petlas', model: 'Explero PT411', ebat: '235/55 R17', yil: 2023, mevsim: 'Dört Mevsim', stok: 13, fiyat: 2450 },
    { id: 15, marka: 'Falken', model: 'ZIEX ZE310 Ecorun', ebat: '195/65 R15', yil: 2023, mevsim: 'Yaz', stok: 21, fiyat: 2100 },
  ]);

  // Arama ve filtreleme
  const filteredLastikler = lastikler.filter(lastik => 
    lastik.marka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lastik.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lastik.ebat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sıralama
  const sortedLastikler = [...filteredLastikler].sort((a, b) => {
    const valA = a[siralamaTuru as keyof Lastik];
    const valB = b[siralamaTuru as keyof Lastik];
    
    // Sayı tipinde sıralama
    if (typeof valA === 'number' && typeof valB === 'number') {
      return siralamaDuzeni === 'asc' ? valA - valB : valB - valA;
    }
    
    // String tipinde sıralama
    const stringA = String(valA).toLowerCase();
    const stringB = String(valB).toLowerCase();
    
    if (siralamaDuzeni === 'asc') {
      return stringA.localeCompare(stringB, 'tr');
    } else {
      return stringB.localeCompare(stringA, 'tr');
    }
  });

  // Sayfalama
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLastikler.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLastikler.length / itemsPerPage);

  // Silme fonksiyonu
  const handleDelete = useCallback((id: number) => {
    try {
      if (window.confirm('Bu lastiği silmek istediğinize emin misiniz?')) {
        // Önce silmeden önce DOM'u güncelle
        const elementToRemove = document.getElementById(`lastik-row-${id}`);
        if (elementToRemove) {
          elementToRemove.style.opacity = '0.5';
        }
        
        // Sonra state'i güvenli şekilde güncelle
        setTimeout(() => {
          setLastikler(prev => prev.filter(lastik => lastik.id !== id));
        }, 50);
      }
    } catch (err) {
      console.error('Lastik silme işlemi sırasında hata:', err);
    }
  }, []);

  // Sıralama fonksiyonu
  const handleSort = useCallback((field: string) => {
    if (field === siralamaTuru) {
      setSiralamaDuzeni(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSiralamaTuru(field);
      setSiralamaDuzeni('asc');
    }
  }, [siralamaTuru]);

  return (
    <div className="space-y-6">
      {/* Başlık ve Üst Bölüm */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Lastik Tablosu</h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Marka, model veya ebat ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            <span>Filtrele</span>
          </button>
          
          <Link 
            href="/bayi/lastik-ekle"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Lastik</span>
          </Link>
        </div>
      </div>

      {/* Lastik Tablosu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('marka')}
                >
                  <div className="flex items-center gap-1">
                    <span>Marka</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center gap-1">
                    <span>Model</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('ebat')}
                >
                  <div className="flex items-center gap-1">
                    <span>Ebat</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('mevsim')}
                >
                  <div className="flex items-center gap-1">
                    <span>Mevsim</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stok')}
                >
                  <div className="flex items-center gap-1">
                    <span>Stok</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('fiyat')}
                >
                  <div className="flex items-center gap-1">
                    <span>Fiyat</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((lastik) => (
                <tr key={lastik.id} id={`lastik-row-${lastik.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    #{lastik.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lastik.marka}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lastik.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lastik.ebat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                      lastik.mevsim === 'Yaz' 
                        ? 'bg-green-100 text-green-700' 
                        : lastik.mevsim === 'Kış' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                    }`}>
                      {lastik.mevsim}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`text-sm ${
                      lastik.stok < 10 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}>
                      {lastik.stok} adet
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {lastik.indirimli ? (
                      <div>
                        <span className="text-red-600 font-medium">{lastik.indirimli.toLocaleString('tr-TR')} ₺</span>
                        <span className="text-gray-400 line-through ml-2">{lastik.fiyat.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    ) : (
                      <span className="text-gray-600">{lastik.fiyat.toLocaleString('tr-TR')} ₺</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800 rounded-md"
                        title="Düzenle"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800 rounded-md"
                        title="Sil"
                        onClick={() => handleDelete(lastik.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam <span className="font-medium">{filteredLastikler.length}</span> lastik
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="text-sm text-gray-600">
              Sayfa <span className="font-medium">{currentPage}</span> / {totalPages}
            </div>
            
            <button 
              className="p-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 