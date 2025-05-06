'use client';

import { useState, useEffect } from 'react';
import { Slider } from '../components/ui/slider';
import { FaSearch, FaSort, FaFilter, FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [loading, setLoading] = useState(true);

  // Verileri Supabase'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // urundetay tablosundan ürünleri çek
        const { data: urunDetayData, error: urunDetayError } = await supabase
          .from('urundetay')
          .select('*');

        if (urunDetayError) {
          console.error('Ürün verisi çekilirken hata oluştu:', urunDetayError);
          throw urunDetayError;
        }
        
        if (!urunDetayData || urunDetayData.length === 0) {
          console.log('Ürün verisi bulunamadı');
          setLoading(false);
          return;
        }

        console.log('Çekilen ürün sayısı:', urunDetayData.length);

        // Ürünlerin stok ve satıcı bilgilerini çek
        const productDataPromises = urunDetayData.flatMap(async (urun) => {
          try {
            // Stok bilgisini çek
            const { data: stokData, error: stokError } = await supabase
              .from('stok')
              .select('*')
              .eq('urun_id', urun.urun_id);

            if (stokError) {
              console.error(`Stok verisi çekilirken hata (ürün_id: ${urun.urun_id}):`, stokError);
              return null;
            }
            
            if (!stokData || stokData.length === 0) {
              console.log(`Stok verisi bulunamadı (ürün_id: ${urun.urun_id})`);
              return null;
            }

            // Aynı ürünün farklı mağazalardaki stokları için ayrı kayıtlar oluştur
            return Promise.all(stokData.map(async (stok) => {
              try {
                // Mağaza bilgisini çek
                const { data: magazaData, error: magazaError } = await supabase
                  .from('sellers')
                  .select('id, isim, sehir')
                  .eq('id', stok.magaza_id)
                  .single();

                if (magazaError) {
                  console.error(`Mağaza verisi çekilirken hata (magaza_id: ${stok.magaza_id}):`, magazaError);
                  return null;
                }
                
                if (!magazaData) {
                  console.log(`Mağaza verisi bulunamadı (magaza_id: ${stok.magaza_id})`);
                  return null;
                }

                // Tüm verileri birleştir
                return {
                  urun_id: urun.urun_id,
                  stok_id: stok.stok_id,
                  model: urun.model || "İsimsiz Ürün",
                  marka: urun.marka || "Bilinmiyor",
                  cap_inch: urun.cap_inch || "",
                  mevsim: urun.mevsim || "Belirtilmemiş",
                  saglik_durumu: urun.saglik_durumu || 0,
                  urun_resmi_0: urun.urun_resmi_0 || "/placeholder-tire.jpg",
                  stok: stok.stok_adet || 0,
                  magaza_id: stok.magaza_id,
                  magaza_isim: magazaData.isim || "Bilinmiyor",
                  magaza_sehir: magazaData.sehir || "Belirtilmemiş",
                  fiyat: stok.fiyat || 0,
                  indirimli_fiyat: stok.indirimli_fiyat || stok.fiyat || 0
                };
              } catch (err) {
                console.error(`Mağaza işlenirken hata (magaza_id: ${stok.magaza_id}):`, err);
                return null;
              }
            }));
          } catch (err) {
            console.error(`Ürün işlenirken hata (ürün_id: ${urun.urun_id}):`, err);
            return null;
          }
        });

        // Tüm ürün bilgilerini bekle ve null olanları filtrele
        const flattenedPromises = (await Promise.all(productDataPromises))
          .filter(result => result !== null)
          .flat()
          .filter(product => product !== null);

        const productData = flattenedPromises as Product[];

        console.log('İşlenen toplam ürün sayısı:', productData.length);

        if (productData.length === 0) {
          console.log('İşlenebilen ürün bulunamadı');
          setLoading(false);
          return;
        }

        setProducts(productData);
        setFilteredProducts(productData);

        // Maksimum fiyat değerini ayarla
        const maxPrice = Math.max(...productData.map(p => p.fiyat));
        setPriceRange([0, maxPrice > 0 ? maxPrice : 10000]);
        
      } catch (error) {
        console.error('Veri çekerken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtreleme işlemi
  useEffect(() => {
    let newFiltered = [...products];

    // Arama filtresi
    if (searchTerm) {
      newFiltered = newFiltered.filter(product =>
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marka.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Fiyat aralığı filtresi
    newFiltered = newFiltered.filter(product => {
      const price = product.indirimli_fiyat || product.fiyat;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Marka filtresi
    if (selectedBrands.length > 0) {
      newFiltered = newFiltered.filter(product => selectedBrands.includes(product.marka));
    }

    // Boyut filtresi
    if (selectedSizes.length > 0) {
      newFiltered = newFiltered.filter(product => selectedSizes.includes(`${product.cap_inch} inç`));
    }

    // Mevsim filtresi
    if (selectedSeasons.length > 0) {
      newFiltered = newFiltered.filter(product => selectedSeasons.includes(product.mevsim));
    }

    // İl filtresi
    if (selectedCities.length > 0) {
      newFiltered = newFiltered.filter(product => selectedCities.includes(product.magaza_sehir));
    }

    // Stok durumu filtresi
    if (stockStatus === 'inStock') {
      newFiltered = newFiltered.filter(product => product.stok > 0);
    } else if (stockStatus === 'outOfStock') {
      newFiltered = newFiltered.filter(product => product.stok === 0);
    }

    // Lastik durumu filtresi
    if (tireCondition === 'new') {
      newFiltered = newFiltered.filter(product => product.saglik_durumu === 100);
    } else if (tireCondition === 'used') {
      newFiltered = newFiltered.filter(product => product.saglik_durumu < 100);
    }

    // Sıralama
    if (sortOption === 'price-asc') {
      newFiltered.sort((a, b) => (a.indirimli_fiyat || a.fiyat) - (b.indirimli_fiyat || b.fiyat));
    } else if (sortOption === 'price-desc') {
      newFiltered.sort((a, b) => (b.indirimli_fiyat || b.fiyat) - (a.indirimli_fiyat || a.fiyat));
    } else if (sortOption === 'name-asc') {
      newFiltered.sort((a, b) => a.model.localeCompare(b.model));
    } else if (sortOption === 'name-desc') {
      newFiltered.sort((a, b) => b.model.localeCompare(a.model));
    } else if (sortOption === 'health-desc') {
      newFiltered.sort((a, b) => b.saglik_durumu - a.saglik_durumu);
    }

    setFilteredProducts(newFiltered);
  }, [products, searchTerm, priceRange, selectedBrands, selectedSizes, selectedSeasons, 
      selectedCities, stockStatus, tireCondition, sortOption]);

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

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedSeasons([]);
    setSelectedCities([]);
    setStockStatus('all');
    setTireCondition('all');
    setSortOption('default');
  };

  // Lastik sağlık durumuna göre renk belirleme
  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white';
    if (health >= 80) return 'bg-green-400 text-white';
    if (health >= 60) return 'bg-yellow-400 text-black';
    if (health >= 40) return 'bg-orange-400 text-white';
    return 'bg-red-500 text-white';
  };

  // Mobil filtre
  const toggleMobileFilter = () => {
    setIsFilterMobileOpen(!isFilterMobileOpen);
  };

  // Sepete ekleme işlemi
  const handleAddToCart = (product: any) => {
    alert(`${product.model} sepete eklendi.`);
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

            {/* Karşılaştırma Kutusu */}
            {compareList.length > 0 && (
              <div className="bg-dark-300 rounded-lg p-4 border border-dark-100 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-3">Karşılaştırma</h3>
                <div className="space-y-2">
                  {compareList.map(id => {
                    const product = products.find(p => p.urun_id === id);
                    return (
                      <div key={id} className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm truncate max-w-[80%]">
                          {product?.model}
                        </span>
                        <button
                          onClick={() => toggleCompare(id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Kaldır
                        </button>
                      </div>
                    );
                  })}
                  <Link
                    href={`/urunler/karsilastir?ids=${compareList.join(',')}`}
                    className={`block text-center bg-primary hover:bg-primary-dark text-white py-2 rounded-md mt-3 ${
                      compareList.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={(e) => {
                      if (compareList.length < 2) {
                        e.preventDefault();
                        alert('En az 2 ürün seçmelisiniz.');
                      }
                    }}
                  >
                    Karşılaştır
                  </Link>
                </div>
              </div>
            )}
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
                  Filtreleri değiştirerek veya aramanızı genişleterek daha fazla sonuç görebilirsiniz.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.urun_id} 
                    className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01]"
                  >
                    <div className="relative">
                      <Link href={`/urun-detay/${product.urun_id}`}>
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
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => toggleCompare(product.urun_id)}
                          className={`p-2 rounded-full ${
                            compareList.includes(product.urun_id)
                              ? 'bg-primary text-white'
                              : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
                          }`}
                          title={compareList.includes(product.urun_id) ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className={`absolute top-2 left-2 ${getHealthColor(product.saglik_durumu)} px-2 py-1 rounded text-xs`}>
                        {product.saglik_durumu === 100 ? 'Sıfır' : `%${product.saglik_durumu}`}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/urun-detay/${product.urun_id}`}>
                          <h3 className="text-lg font-medium text-white hover:text-primary transition-colors">
                            {product.model}
                          </h3>
                        </Link>
                        <span className="bg-primary px-2 py-1 rounded text-xs text-white">
                          {product.marka}
                        </span>
                      </div>
                      <div className="mb-2 text-sm text-gray-400">
                        {product.cap_inch} inç | {product.mevsim}
                      </div>
                      {renderShopAndCity(product)}
                      <div className="flex items-baseline mb-3">
                        {product.indirimli_fiyat !== product.fiyat ? (
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
                            {product.fiyat}₺
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${product.stok > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.stok > 0 ? 'Stokta' : 'Tükendi'}
                        </span>
                        <div className="flex space-x-2">
                          <Link
                            href={`/urun-detay/${product.urun_id}`}
                            className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Detaylar
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
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
                ))}
              </div>
            )}

            {/* Sayfalama */}
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button className="px-3 py-1 rounded-md bg-dark-300 text-gray-400 hover:bg-dark-200" disabled>
                    Önceki
                  </button>
                  <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
                  <button className="px-3 py-1 rounded-md bg-dark-300 text-gray-400 hover:bg-dark-200">2</button>
                  <button className="px-3 py-1 rounded-md bg-dark-300 text-gray-400 hover:bg-dark-200">3</button>
                  <span className="px-3 py-1 text-gray-400">...</span>
                  <button className="px-3 py-1 rounded-md bg-dark-300 text-gray-400 hover:bg-dark-200">10</button>
                  <button className="px-3 py-1 rounded-md bg-dark-300 text-gray-400 hover:bg-dark-200">
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}