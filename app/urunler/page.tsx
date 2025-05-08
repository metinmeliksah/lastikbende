'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Slider } from '../components/ui/slider';
import { FaSearch, FaSort, FaFilter, FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sayfa başına ürün sayısı
const PRODUCTS_PER_PAGE = 9;

// Marka verileri
const brands = [
  'Michelin', 'Bridgestone', 'Pirelli', 'Goodyear', 'Continental', 
  'Dunlop', 'Hankook', 'Yokohama', 'BFGoodrich', 'Kumho', 'Lassa'
];

// Boyut verileri
const sizes = ['16 inç', '17 inç', '18 inç', '19 inç', '20 inç', '21 inç'];

// Mevsim verileri
const seasons = ['Yaz', 'Kış', '4 Mevsim'];

// İl verileri
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Elazığ', 'Trabzon'];

// Stok durumu seçenekleri
const stockOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'inStock', label: 'Stokta Var' },
  { value: 'outOfStock', label: 'Stokta Yok' }
];

// Lastik durumu seçenekleri
const tireConditionOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'new', label: 'Sıfır' },
  { value: 'used', label: 'İkinci El' }
];

// Ürün veri tipini tanımla
interface Product {
  urun_id: number;
  stok_id: number;
  model: string;
  marka: string;
  cap_inch: string;
  mevsim: string;
  saglik_durumu: number;
  urun_resmi_0: string;
  stok: number;
  magaza_id: number;
  magaza_isim: string;
  magaza_sehir: string;
  fiyat: number;
  indirimli_fiyat: number;
}

export default function UrunlerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [stockStatus, setStockStatus] = useState('all'); // all, inStock, outOfStock
  const [tireCondition, setTireCondition] = useState('all'); // all, new, used
  const [sortOption, setSortOption] = useState('default');
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompareList, setShowCompareList] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Sayfalama için state'ler
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // URL'den filtreleri ve sayfa numarasını al
  useEffect(() => {
    // URL'den parametreleri al
    const mevsimParam = searchParams.get('mevsim');
    const pageParam = searchParams.get('page');
    const markaParam = searchParams.get('marka');
    const sehirParam = searchParams.get('sehir');
    const boyutParam = searchParams.get('boyut');
    const stokParam = searchParams.get('stok');
    const durumParam = searchParams.get('durum');
    const siraParam = searchParams.get('sira');
    
    // Mevsim filtresi
    if (mevsimParam) {
      setSelectedSeasons(mevsimParam.split(','));
    }
    
    // Sayfa numarası
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
    
    // Marka filtresi
    if (markaParam) {
      setSelectedBrands(markaParam.split(','));
    }
    
    // Şehir filtresi
    if (sehirParam) {
      setSelectedCities(sehirParam.split(','));
    }
    
    // Boyut filtresi
    if (boyutParam) {
      setSelectedSizes(boyutParam.split(','));
    }
    
    // Stok durumu
    if (stokParam) {
      setStockStatus(stokParam);
    }
    
    // Lastik durumu
    if (durumParam) {
      setTireCondition(durumParam);
    }
    
    // Sıralama
    if (siraParam) {
      setSortOption(siraParam);
    }
    
  }, [searchParams]);

  // Verileri Supabase'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Önce stok verilerini çek
        const { data: stokData, error: stokError } = await supabase
          .from('stok')
          .select(`
            *,
            urundetay (*),
            seller:magaza_id (
              id,
              isim,
              sehir
            )
          `)
          .order('stok_id', { ascending: true });

        if (stokError) {
          console.error('Stok verisi çekilirken hata oluştu:', stokError);
          throw stokError;
        }
        
        if (!stokData || stokData.length === 0) {
          console.log('Ürün verisi bulunamadı');
          setLoading(false);
          return;
        }

        // Ürün verilerini stok_id'ye göre düzenle
        const productData = stokData.map(stok => ({
          urun_id: stok.urun_id,
          stok_id: stok.stok_id,
          model: stok.urundetay?.model || "İsimsiz Ürün",
          marka: stok.urundetay?.marka || "Bilinmiyor",
          cap_inch: stok.urundetay?.cap_inch || "",
          mevsim: stok.urundetay?.mevsim || "Belirtilmemiş",
          saglik_durumu: stok.saglik_durumu || 0,
          urun_resmi_0: stok.urundetay?.urun_resmi_0 || "/placeholder-tire.jpg",
          stok: stok.stok_adet || 0,
          magaza_id: stok.magaza_id,
          magaza_isim: stok.seller?.isim || "Bilinmiyor",
          magaza_sehir: stok.seller?.sehir || "Belirtilmemiş",
          fiyat: stok.fiyat || 0,
          indirimli_fiyat: stok.indirimli_fiyat || stok.fiyat || 0
        }));

        // Benzersiz markaları al
        const uniqueBrands = Array.from(new Set(productData.map(p => p.marka))).sort();
        brands.length = 0;
        brands.push(...uniqueBrands);

        // Benzersiz şehirleri al
        const uniqueCities = Array.from(new Set(productData.map(p => p.magaza_sehir))).sort();
        cities.length = 0;
        cities.push(...uniqueCities);

        // Benzersiz boyutları al
        const uniqueSizes = Array.from(new Set(productData.map(p => `${p.cap_inch} inç`))).sort();
        sizes.length = 0;
        sizes.push(...uniqueSizes);

        // Benzersiz mevsimleri al
        const uniqueSeasons = Array.from(new Set(productData.map(p => p.mevsim))).sort();
        seasons.length = 0;
        seasons.push(...uniqueSeasons);

        setProducts(productData);
        setFilteredProducts(productData);
        
        // Maksimum fiyat değerini ayarla
        const maxPrice = Math.max(...productData.map(p => p.indirimli_fiyat));
        setPriceRange([0, maxPrice > 0 ? maxPrice : 10000]);
        
      } catch (error) {
        console.error('Veri çekerken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtreleme parametrelerini URL'ye ekle
  const updateURLWithFilters = () => {
    const url = new URL(window.location.href);
    
    // Sayfa numarası
    if (currentPage > 1) {
      url.searchParams.set('page', currentPage.toString());
    } else {
      url.searchParams.delete('page');
    }
    
    // Mevsim filtresi
    if (selectedSeasons.length > 0) {
      url.searchParams.set('mevsim', selectedSeasons.join(','));
    } else {
      url.searchParams.delete('mevsim');
    }
    
    // Marka filtresi
    if (selectedBrands.length > 0) {
      url.searchParams.set('marka', selectedBrands.join(','));
    } else {
      url.searchParams.delete('marka');
    }
    
    // Şehir filtresi
    if (selectedCities.length > 0) {
      url.searchParams.set('sehir', selectedCities.join(','));
    } else {
      url.searchParams.delete('sehir');
    }
    
    // Boyut filtresi
    if (selectedSizes.length > 0) {
      url.searchParams.set('boyut', selectedSizes.join(','));
    } else {
      url.searchParams.delete('boyut');
    }
    
    // Stok durumu
    if (stockStatus !== 'all') {
      url.searchParams.set('stok', stockStatus);
    } else {
      url.searchParams.delete('stok');
    }
    
    // Lastik durumu
    if (tireCondition !== 'all') {
      url.searchParams.set('durum', tireCondition);
    } else {
      url.searchParams.delete('durum');
    }
    
    // Sıralama
    if (sortOption !== 'default') {
      url.searchParams.set('sira', sortOption);
    } else {
      url.searchParams.delete('sira');
    }
    
    // URL'yi güncelle
    window.history.pushState({}, '', url);
  };

  // Sayfalama ve filtreleme mantığını birleştir
  useEffect(() => {
    if (products.length === 0) return;
    
    let filtered = [...products];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marka.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Fiyat filtresi
    filtered = filtered.filter(product =>
      Number(product.indirimli_fiyat) >= Number(priceRange[0]) && 
      Number(product.indirimli_fiyat) <= Number(priceRange[1])
    );

    // Marka filtresi
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.marka)
      );
    }

    // Boyut filtresi
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        selectedSizes.includes(`${product.cap_inch} inç`)
      );
    }

    // Mevsim filtresi
    if (selectedSeasons.length > 0) {
      filtered = filtered.filter(product =>
        selectedSeasons.includes(product.mevsim)
      );
    }

    // Şehir filtresi
    if (selectedCities.length > 0) {
      filtered = filtered.filter(product =>
        selectedCities.includes(product.magaza_sehir)
      );
    }

    // Stok durumu filtresi
    if (stockStatus === 'inStock') {
      filtered = filtered.filter(product => product.stok > 0);
    } else if (stockStatus === 'outOfStock') {
      filtered = filtered.filter(product => product.stok <= 0);
    }

    // Lastik durumu filtresi
    if (tireCondition === 'new') {
      filtered = filtered.filter(product => product.saglik_durumu === 100);
    } else if (tireCondition === 'used') {
      filtered = filtered.filter(product => product.saglik_durumu < 100);
    }

    // Sıralama
    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => Number(a.indirimli_fiyat) - Number(b.indirimli_fiyat));
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => Number(b.indirimli_fiyat) - Number(a.indirimli_fiyat));
    } else if (sortOption === 'name-asc') {
      filtered.sort((a, b) => a.model.localeCompare(b.model));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => b.model.localeCompare(a.model));
    } else if (sortOption === 'health-desc') {
      filtered.sort((a, b) => b.saglik_durumu - a.saglik_durumu);
    } else {
      // Varsayılan sıralama: stok_id'ye göre artan sırada
      filtered.sort((a, b) => a.stok_id - b.stok_id);
    }

    // Filtrelenmiş ürünleri güncelle
    setFilteredProducts(filtered);
    
    // Filtreleme değiştiğinde sayfa numarasını 1'e ayarla (sayfa değişikliğinde bu etkilenmeyecek)
    if (
      searchTerm || 
      selectedBrands.length > 0 || 
      selectedSizes.length > 0 || 
      selectedSeasons.length > 0 || 
      selectedCities.length > 0 || 
      stockStatus !== 'all' || 
      tireCondition !== 'all' || 
      sortOption !== 'default' ||
      priceRange[0] !== 0 || 
      priceRange[1] !== (Math.max(...products.map(p => p.indirimli_fiyat)))
    ) {
      setCurrentPage(1);
    }
    
    // URL'yi güncelle
    updateURLWithFilters();

  }, [
    products,
    searchTerm,
    priceRange,
    selectedBrands,
    selectedSizes,
    selectedSeasons,
    selectedCities,
    stockStatus,
    tireCondition,
    sortOption
  ]);

  // Sayfalama işlemi - sadece filteredProducts veya currentPage değiştiğinde çalışır
  useEffect(() => {
    if (filteredProducts.length === 0) {
      setDisplayedProducts([]);
      setTotalPages(1);
      return;
    }

    // Toplam sayfa sayısını hesapla
    const calculatedTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    setTotalPages(calculatedTotalPages);
    
    // Geçerli sayfa numarasını kontrol et
    const validCurrentPage = Math.min(Math.max(1, currentPage), calculatedTotalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    // Sayfadaki ürünleri belirle - her sayfada tam olarak 9 ürün
    const startIndex = (validCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    // Tamamen yeni bir dizi olarak gönder, önceki ürünleri temizle
    const newDisplayedProducts = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts(newDisplayedProducts);
    
    // URL'yi güncelle
    updateURLWithFilters();
    
  }, [filteredProducts, currentPage]);

  // Sayfa değiştirme işlemi
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    // Tarayıcının geçmişini değiştirmeden sadece URL güncelleniyor
    window.history.replaceState(
      null,
      '',
      `?page=${page}${window.location.search.replace(/[?&]page=\d+/, '')}`
    );
    
    // Sayfayı güncelle
    setCurrentPage(page);
    
    // Sayfanın başına dön
    window.scrollTo(0, 0);
  };

  // Karşılaştırma listesine ekleme/çıkarma
  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(item => item !== id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, id]);
      } else {
        alert('En fazla 3 ürün karşılaştırabilirsiniz.');
      }
    }
  };

  // Filtre işleyicileri
  const handleBrandChange = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(item => item !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleSizeChange = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(item => item !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSeasonChange = (season: string) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter(item => item !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  const handleCityChange = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(item => item !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleStockStatusChange = (status: string) => {
    setStockStatus(status);
  };

  const handleTireConditionChange = (condition: string) => {
    setTireCondition(condition);
  };

  // Filtreleri temizle
  const resetFilters = () => {
    setSearchTerm('');
    const maxPrice = Math.max(...products.map(p => p.indirimli_fiyat));
    setPriceRange([0, maxPrice > 0 ? maxPrice : 10000]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedSeasons([]);
    setSelectedCities([]);
    setStockStatus('all');
    setTireCondition('all');
    setSortOption('default');
    
    // URL'yi temizle
    window.history.pushState({}, '', window.location.pathname);
  };

  // Lastik sağlık durumuna göre renk belirleme
  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white';
    if (health >= 70) return 'bg-green-500 text-white';
    if (health >= 40) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  // Mobil filtre
  const toggleMobileFilter = () => {
    setIsFilterMobileOpen(!isFilterMobileOpen);
  };

  // Satıcı adı ve şehir ayrı gösterilecek
  const renderShopAndCity = (product: Product) => {
    return (
      <div className="flex flex-col mb-3">
        <div className="text-gray-300 text-sm truncate">
          {product.magaza_isim}
        </div>
        <div className="text-gray-400 text-xs">
          {product.magaza_sehir}
        </div>
      </div>
    );
  };

  // Karşılaştırma sayfasına git
  const handleCompare = () => {
    if (compareList.length < 2) {
      alert('Karşılaştırma için en az 2 ürün seçmelisiniz.');
      return;
    }
    
    router.push(`/karsilastir?ids=${compareList.join(',')}`);
  };

  // Ürün kartı bileşeni
  const ProductCard = ({ product, toggleCompare, compareList }: { product: Product, toggleCompare: (id: number) => void, compareList: number[] }) => {
    const { sepeteEkle } = useCart();
    const isInCompareList = compareList.includes(product.urun_id);
    
    const handleAddToCart = () => {
      sepeteEkle({
        id: product.urun_id,
        isim: product.model,
        ebat: `${product.cap_inch} inç`,
        fiyat: Number(product.indirimli_fiyat),
        adet: 1,
        resim: product.urun_resmi_0,
        stok_id: product.stok_id
      });
      toast.success('Ürün sepete eklendi');
    };

    return (
      <div className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01] flex flex-col h-full">
        <div className="relative">
          <Link href={`/urun-detay/${product.urun_id}?stok_id=${product.stok_id}`}>
            <div className="h-48 bg-gray-700 flex items-center justify-center">
              <Image
                src={product.urun_resmi_0}
                alt={product.model}
                width={200}
                height={200}
                className="object-contain w-full h-full"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
          <div className={`absolute top-2 left-2 ${getHealthColor(product.saglik_durumu)} px-2 py-1 rounded text-xs`}>
            {product.saglik_durumu === 100 ? 'Sıfır' : `%${product.saglik_durumu}`}
          </div>
          {/* Karşılaştırma butonu */}
          <button 
            onClick={() => toggleCompare(product.urun_id)} 
            className={`absolute top-2 right-2 p-1.5 rounded-full ${
              isInCompareList ? 'bg-primary text-white' : 'bg-gray-600 bg-opacity-70 text-white hover:bg-gray-500'
            }`}
            title={isInCompareList ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <Link href={`/urun-detay/${product.urun_id}?stok_id=${product.stok_id}`}>
              <h3 className="text-lg font-medium text-white hover:text-primary transition-colors">
                {product.model}
              </h3>
            </Link>
            <span className="bg-primary px-2 py-1 rounded text-xs text-white">
              {product.marka}
            </span>
          </div>
          
          {/* Sabit İnç ve Mevsim Bilgisi */}
          <div className="mb-2 text-sm text-gray-400 h-6">
            {product.cap_inch} inç | {product.mevsim}
          </div>
          
          {/* Sabit Mağaza Bilgileri */}
          <div className="mb-3 h-14">
            <div className="text-gray-300 text-sm truncate">
              {product.magaza_isim}
            </div>
            <div className="text-gray-400 text-xs">
              {product.magaza_sehir}
            </div>
          </div>
          
          <div className="flex items-baseline mb-3">
            {Number(product.indirimli_fiyat) !== Number(product.fiyat) ? (
              <>
                <span className="text-xl font-bold text-white mr-2">
                  {product.indirimli_fiyat}₺
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {product.fiyat}₺
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-white">
                {product.indirimli_fiyat}₺
              </span>
            )}
          </div>
          
          {/* Sabit Alt Kısım */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${product.stok > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.stok > 0 ? 'Stokta' : 'Tükendi'}
              </span>
              <div className="flex space-x-2">
                <Link
                  href={`/urun-detay/${product.urun_id}?stok_id=${product.stok_id}`}
                  className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Detaylar
                </Link>
                <button
                  onClick={handleAddToCart}
                  className={`bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center ${product.stok <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={product.stok <= 0}
                >
                  <FaShoppingCart className="mr-1" />
                  <span>Sepete Ekle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Ürünler</h1>

        {/* Arama ve Filtre Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün veya marka ara..."
              className="w-full px-4 py-2 pl-10 rounded-md bg-dark-300 border border-dark-100 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-dark-300 text-white border border-dark-100 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="default">Sıralama</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name-asc">İsim: A-Z</option>
                <option value="name-desc">İsim: Z-A</option>
                <option value="health-desc">Lastik Sağlığı</option>
              </select>
            </div>

            <button
              onClick={toggleMobileFilter}
              className="md:hidden flex items-center space-x-2 bg-primary text-white px-3 py-1 rounded-md"
            >
              <FaFilter />
              <span>Filtrele</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Filtreler - Desktop */}
          <div className={`md:block md:w-1/4 md:pr-6 ${isFilterMobileOpen ? 'block' : 'hidden'}`}>
            <div className="bg-dark-300 rounded-lg p-4 mb-4 border border-dark-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Filtrele</h3>
                <button
                  onClick={resetFilters}
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Filtreleri Temizle
                </button>
              </div>

              {/* Fiyat Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Fiyat</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 10000]}
                    min={0}
                    max={10000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{priceRange[0]}₺</span>
                    <span>{priceRange[1]}₺</span>
                  </div>
                </div>
              </div>

              {/* Stok Durumu Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Stok Durumu</h4>
                <div className="space-y-1">
                  {stockOptions.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`stock-${option.value}`}
                        checked={stockStatus === option.value}
                        onChange={() => handleStockStatusChange(option.value)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`stock-${option.value}`} className="text-gray-300 text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lastik Durumu Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Lastik Durumu</h4>
                <div className="space-y-1">
                  {tireConditionOptions.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`condition-${option.value}`}
                        checked={tireCondition === option.value}
                        onChange={() => handleTireConditionChange(option.value)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`condition-${option.value}`} className="text-gray-300 text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marka Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Markası</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                  {brands.map((brand, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${index}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`brand-${index}`} className="text-gray-300 text-sm">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bayi İli Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Bayi İli</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                  {cities.map((city, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`city-${index}`}
                        checked={selectedCities.includes(city)}
                        onChange={() => handleCityChange(city)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`city-${index}`} className="text-gray-300 text-sm">
                        {city}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boyut Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Boyut</h4>
                <div className="space-y-1">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`size-${index}`}
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`size-${index}`} className="text-gray-300 text-sm">
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mevsim Filtresi */}
              <div className="mb-4">
                <h4 className="text-gray-200 mb-2 font-medium">Mevsim</h4>
                <div className="space-y-1">
                  {seasons.map((season, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`season-${index}`}
                        checked={selectedSeasons.includes(season)}
                        onChange={() => handleSeasonChange(season)}
                        className="mr-2 accent-primary"
                      />
                      <label htmlFor={`season-${index}`} className="text-gray-300 text-sm">
                        {season}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ürün Listesi */}
          <div className="w-full md:w-3/4">
            {loading ? (
              <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
                <h3 className="text-xl text-gray-200 mb-2">Ürünler Yükleniyor...</h3>
                <p className="text-gray-400">
                  Lütfen bekleyin, ürünler yükleniyor.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
                <h3 className="text-xl text-gray-200 mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-400">
                  Arama kriterlerinize uygun ürün bulunamadı. Lütfen filtrelerinizi değiştirin.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {displayedProducts.map((product) => (
                    <ProductCard 
                      key={product.urun_id} 
                      product={product} 
                      toggleCompare={toggleCompare}
                      compareList={compareList}
                    />
                  ))}
                </div>

                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? "bg-dark-200 text-gray-500 cursor-not-allowed"
                            : "bg-dark-200 text-white hover:bg-dark-100"
                        }`}
                      >
                        Önceki
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-dark-200 text-white hover:bg-dark-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === totalPages
                            ? "bg-dark-200 text-gray-500 cursor-not-allowed"
                            : "bg-dark-200 text-white hover:bg-dark-100"
                        }`}
                      >
                        Sonraki
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Karşılaştırma Butonu - Eğer karşılaştırma listesinde ürün varsa göster */}
        {compareList.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-dark-200 rounded-lg p-4 border border-dark-100 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Karşılaştırma ({compareList.length})</h3>
                <button
                  onClick={() => setCompareList([])}
                  className="text-gray-400 hover:text-white"
                >
                  Temizle
                </button>
              </div>
              <button
                onClick={handleCompare}
                className={`w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md ${
                  compareList.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={compareList.length < 2}
              >
                Karşılaştır
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}