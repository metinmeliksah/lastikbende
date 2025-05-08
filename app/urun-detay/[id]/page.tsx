'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaTruck, FaTools, FaStore, FaMapMarkerAlt, FaCheckCircle, FaStar, FaChevronLeft, FaChevronRight, FaInfoCircle, FaBox } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Params {
  id: string;
}

interface ProductData {
  urun_id: number;
  model: string;
  marka: string;
  cap_inch: string;
  mevsim: string;
  saglik_durumu: number;
  aciklama: string;
  genislik_mm: string;
  profil: string;
  yapi: string;
  yuk_endeksi: string;
  hiz_endeksi: string;
  features: string[];
  urun_resmi_0: string;
  urun_resmi_1?: string;
  urun_resmi_2?: string;
  urun_resmi_3?: string;
  fiyat?: number;           // For display compatibility
  discountedPrice?: number; // For display compatibility
  shippingCompanies?: string[]; // For backward compatibility
}

// Mağaza veri tipi tanımla
interface Shop {
  id: number;
  stok_id: number;
  name: string;
  city: string;
  address: string;
  fiyat: number;
  indirimli_fiyat: number;
  stock: number;
  hasMontage: boolean;
  shippingCompanies: string[];
  rating: number;
  saglik_durumu: number;
}

// Kredi kartı taksit veri tipi tanımla
interface CreditCardInstallment {
  bank: string;
  rates: {
    installments: number;
    price: number; // Bu alanı değiştirmiyoruz çünkü taksit tutarını ifade ediyor
    total: number;
  }[];
}

// Stok veri tipi tanımla
interface StockProduct {
  stok_id: number;
  urun_id: number;
  saglik_durumu: number;
  fiyat: number;
  indirimli_fiyat: number | null;
  stok_adet: number;
  magaza_id: number;
  urundetay: {
    model: string;
    marka: string;
    cap_inch: string;
    mevsim: string;
    urun_resmi_0: string | null;
  } | null;
  sellers: {
    id: number;
    isim: string;
    sehir: string;
  } | null;
}

// Tam ürün veri tipi tanımla
interface FullProduct {
  product: ProductData;
  shops: Shop[];
  creditCardInstallments: CreditCardInstallment[];
  similarProducts: SimilarProduct[];
  features: string[] | string;
}

// Benzer ürün tipi
interface SimilarProduct {
  urun_id: number;
  model: string;
  marka: string;
  cap_inch: string;
  mevsim: string;
  saglik_durumu: number;
  urun_resmi_0: string;
  fiyat: number;
  indirimli_fiyat: number;
  stok: number;
  magaza_isim: string;
  magaza_sehir: string;
}

// Örnek benzer ürün verileri
const dummyProducts = [
  {
    id: 2,
    name: 'Michelin Pilot Sport 5',
    brand: 'Michelin',
    fiyat: 1299,
    discountedPrice: 1199,
    image: '/placeholder-tire.jpg',
    health: 100,
    size: '18 inç',
    season: 'Yaz',
    stock: 5,
    shop: 'Lassa Lastik Satış A.Ş.',
    city: 'İstanbul',
  },
  {
    id: 3,
    name: 'Bridgestone Turanza T005',
    brand: 'Bridgestone',
    fiyat: 1199,
    discountedPrice: null,
    image: '/placeholder-tire.jpg',
    health: 90,
    size: '16 inç',
    season: '4 Mevsim',
    stock: 8,
    shop: 'Pirelli Lastik Merkez',
    city: 'Ankara',
  },
  {
    id: 4,
    name: 'Continental ContiWinterContact',
    brand: 'Continental',
    fiyat: 1399,
    discountedPrice: 1299,
    image: '/placeholder-tire.jpg',
    health: 100,
    size: '17 inç',
    season: 'Kış',
    stock: 12,
    shop: 'Goodyear Bayii',
    city: 'İzmir',
  },
  {
    id: 5,
    name: 'Pirelli P Zero',
    brand: 'Pirelli',
    fiyat: 1599,
    discountedPrice: 1499,
    image: '/placeholder-tire.jpg',
    health: 80,
    size: '19 inç',
    season: 'Yaz',
    stock: 0,
    shop: 'Continental Merkez',
    city: 'Bursa',
  },
];

export default function UrunDetayPage({ params }: { params: Params }) {
  const { sepeteEkle } = useCart();
  const [fullProduct, setFullProduct] = useState<FullProduct | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [showAllShops, setShowAllShops] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [cheapestShop, setCheapestShop] = useState<Shop | null>(null);
  const [showCheapestWarning, setShowCheapestWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [shopSortOption, setShopSortOption] = useState('price-asc');
  const [productData, setProductData] = useState<ProductData | null>(null);

  // Bütün resim URL'lerini alıp geçerli olanları filtrele
  const getProductImages = (product: ProductData | null | undefined) => {
    if (!product) return [];
    
    return [
      product.urun_resmi_0, 
      product.urun_resmi_1, 
      product.urun_resmi_2, 
      product.urun_resmi_3
    ].filter((img): img is string => Boolean(img));
  };

  // Benzer ürünleri çek
  const fetchSimilarProducts = async (): Promise<SimilarProduct[]> => {
    try {
      if (!productData?.cap_inch || !productData?.mevsim) {
        console.log("Ürün verisi eksik, benzer ürünler getirilemedi");
        return [];
      }

      // Öncelikle tam olarak aynı inç (çap) olan ürünleri çek
      const { data: sameSizeProducts, error: sizeError } = await supabase
        .from('stok')
        .select(`
          stok_id,
          urun_id,
          saglik_durumu,
          fiyat,
          indirimli_fiyat,
          stok_adet,
          magaza_id,
          urundetay:urundetay (
            model,
            marka,
            cap_inch,
            mevsim,
            urun_resmi_0
          ),
          sellers:magaza_id (
            id,
            isim,
            sehir
          )
        `)
        .eq('urundetay.cap_inch', productData.cap_inch)
        .neq('urun_id', productData.urun_id)
        .limit(8) as { data: StockProduct[] | null; error: any };

      if (sizeError) {
        console.error("Aynı boyuttaki ürünler çekilirken hata:", sizeError);
        return [];
      }

      // Aynı mevsim olan ürünleri çek
      const { data: sameSeasonProducts, error: seasonError } = await supabase
        .from('stok')
        .select(`
          stok_id,
          urun_id,
          saglik_durumu,
          fiyat,
          indirimli_fiyat,
          stok_adet,
          magaza_id,
          urundetay:urundetay (
            model,
            marka,
            cap_inch,
            mevsim,
            urun_resmi_0
          ),
          sellers:magaza_id (
            id,
            isim,
            sehir
          )
        `)
        .eq('urundetay.mevsim', productData.mevsim)
        .neq('urun_id', productData.urun_id)
        .limit(8) as { data: StockProduct[] | null; error: any };

      if (seasonError) {
        console.error("Aynı mevsim ürünleri çekilirken hata:", seasonError);
        return [];
      }

      // Benzer ürünler dizisini hazırla
      let sameCapAndSeasonProducts: StockProduct[] = [];
      let sameCapProducts: StockProduct[] = [];
      let sameSeasonProducts1: StockProduct[] = [];

      if (sameSizeProducts && sameSizeProducts.length > 0) {
        // Aynı çap ve mevsime sahip olanları ayır
        sameCapAndSeasonProducts = sameSizeProducts.filter(
          (item): item is StockProduct => item?.urundetay?.mevsim === productData.mevsim
        );

        // Aynı çapa sahip ama farklı mevsim olanları ayır
        sameCapProducts = sameSizeProducts.filter(
          (item): item is StockProduct => item?.urundetay?.mevsim !== productData.mevsim
        );
      }

      if (sameSeasonProducts && sameSeasonProducts.length > 0) {
        // Aynı mevsime sahip ama çapı farklı olanları ayır
        sameSeasonProducts1 = sameSeasonProducts.filter(
          (item): item is StockProduct => item?.urundetay?.cap_inch !== productData.cap_inch
        );
      }

      // Öncelik sırasıyla ürünleri ekle (en fazla 4 ürün)
      let combinedProducts = [
        ...sameCapAndSeasonProducts,
        ...sameCapProducts,
        ...sameSeasonProducts1
      ].filter((item): item is StockProduct => Boolean(item?.urundetay) && Boolean(item?.sellers)); // Filter out items with missing data

      // Benzersiz ürünleri filtrele (aynı ürün farklı mağaza olabilir)
      const uniqueProductIds = new Set<number>();
      combinedProducts = combinedProducts.filter(item => {
        if (!item?.urun_id || uniqueProductIds.has(item.urun_id)) {
          return false;
        }
        uniqueProductIds.add(item.urun_id);
        return true;
      });

      // En fazla 4 ürün olacak şekilde kes
      combinedProducts = combinedProducts.slice(0, 4);

      // Ürün bilgilerini düzenle
      const processedProducts = combinedProducts.map(item => ({
        urun_id: item.urun_id,
        model: item.urundetay?.model || 'Bilinmiyor',
        marka: item.urundetay?.marka || 'Bilinmiyor',
        cap_inch: item.urundetay?.cap_inch || '',
        mevsim: item.urundetay?.mevsim || 'Belirtilmemiş',
        saglik_durumu: item.saglik_durumu || 0,
        urun_resmi_0: item.urundetay?.urun_resmi_0 || "/placeholder-tire.jpg",
        fiyat: item.fiyat || 0,
        indirimli_fiyat: item.indirimli_fiyat || item.fiyat || 0,
        stok: item.stok_adet || 0,
        magaza_isim: item.sellers?.isim || "Bilinmiyor",
        magaza_sehir: item.sellers?.sehir || "Belirtilmemiş"
      }));

      return processedProducts;
    } catch (err) {
      console.error("Benzer ürünler çekilirken hata:", err);
      return [];
    }
  };

  // Ürün verilerini Supabase'den çek
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        console.log("Ürün verileri çekiliyor, ID:", params.id);
        
        // URL'den stok_id parametresini al
        const urlParams = new URLSearchParams(window.location.search);
        const stokIdParam = urlParams.get('stok_id');
        
        // Ürün detaylarını çek
        const { data: productDataResponse, error: productError } = await supabase
          .from('urundetay')
          .select('*')
          .eq('urun_id', params.id)
          .single();

        if (productError) {
          console.error("Ürün verisi çekilirken hata:", productError);
          throw productError;
        }
        
        if (!productDataResponse) {
          console.error("Ürün bulunamadı");
          throw new Error('Ürün bulunamadı');
        }

        setProductData(productDataResponse);
        
        // Ürün için stok bilgilerini çek
        const { data: stockData, error: stockError } = await supabase
          .from('stok')
          .select('*')
          .eq('urun_id', params.id);

        if (stockError) {
          console.error("Stok verisi çekilirken hata:", stockError);
          throw stockError;
        }
        
        if (!stockData || stockData.length === 0) {
          console.error("Stok bilgisi bulunamadı");
          throw new Error('Stok bilgisi bulunamadı');
        }
        
        console.log(`${stockData.length} adet stok kaydı bulundu`);

        // Mağaza ve teslimat bilgilerini çek
        const shopPromises = stockData.map(async (stock) => {
          try {
            // Mağaza bilgisini çek
            const { data: sellerData, error: sellerError } = await supabase
              .from('sellers')
              .select(`
                id,
                isim,
                sehir,
                adres
              `)
              .eq('id', stock.magaza_id)
              .single();

            if (sellerError) {
              console.error(`Mağaza verisi çekilirken hata (ID: ${stock.magaza_id}):`, sellerError);
              return null;
            }
            
            if (!sellerData) {
              console.error(`Mağaza bulunamadı (ID: ${stock.magaza_id})`);
              return null;
            }

            // Teslimat seçeneklerini çek
            const { data: deliveryOptions, error: deliveryError } = await supabase
              .from('teslimat_secenekleri')
              .select('*')
              .eq('stok_id', stock.stok_id);

            if (deliveryError) {
              console.error(`Teslimat seçenekleri çekilirken hata (stok_id: ${stock.stok_id}):`, deliveryError);
            }
            
            // Teslimat bilgilerini hazırla
            let hasMontage = false;
            let shippingCompanies: string[] = [];
            
            if (deliveryOptions && deliveryOptions.length > 0) {
              hasMontage = deliveryOptions.some(option => option.magazada_montaj === true);
              
              // Kargo şirketlerini al
              shippingCompanies = deliveryOptions
                .filter(option => option.kargo_firmasi)
                .map(option => option.kargo_firmasi)
                .filter((value, index, self) => self.indexOf(value) === index); // Benzersiz değerler
            }
            
            // Mağaza bilgilerini döndür
            return {
              id: sellerData.id,
              stok_id: stock.stok_id,
              name: sellerData.isim,
              city: sellerData.sehir,
              address: sellerData.adres || '',
              fiyat: stock.fiyat,
              indirimli_fiyat: stock.indirimli_fiyat || stock.fiyat,
              stock: stock.stok_adet,
              hasMontage: hasMontage,
              shippingCompanies: shippingCompanies.length > 0 ? shippingCompanies : ['Belirtilmemiş'],
              rating: 4.5,
              saglik_durumu: stock.saglik_durumu
            };
          } catch (err) {
            console.error(`Mağaza bilgileri işlenirken hata:`, err);
            return null;
          }
        });

        const shops = (await Promise.all(shopPromises)).filter((shop): shop is Shop => shop !== null);

        if (shops.length === 0) {
          console.error("Mağaza bilgisi bulunamadı");
          throw new Error('Mağaza bilgisi bulunamadı');
        }
        
        console.log(`${shops.length} adet mağaza bilgisi işlendi`);

        // Ürün özelliklerini parse et (string'den array'e)
        let features: string[] = [];
        try {
          if (productDataResponse.features) {
            if (typeof productDataResponse.features === 'string') {
              features = JSON.parse(productDataResponse.features);
            } else if (Array.isArray(productDataResponse.features)) {
              features = productDataResponse.features;
            }
          }
        } catch (e) {
          console.error("Ürün özellikleri ayrıştırılırken hata:", e);
          features = [];
        }

        // Benzer ürünleri çek
        const similarProductsData = await fetchSimilarProducts();
        setSimilarProducts(similarProductsData);
        
        console.log(`${similarProductsData.length} adet benzer ürün bulundu`);

        // Daha sonra kredi kartı taksit bilgisini çek
        const { data: installmentData, error: installmentError } = await supabase
          .from('kredi_karti_taksit')
          .select('*')
          .eq('urun_id', params.id);

        if (installmentError) {
          console.error("Taksit bilgisi çekilirken hata:", installmentError);
        }

        // Taksit bilgilerini düzenle
        const processedInstallments = installmentData?.map(item => ({
          bank: item.bank,
          rates: item.rates || []
        })) || [];

        // Tam ürün verisi oluştur
        const fullProductData: FullProduct = {
          product: productDataResponse as ProductData,
          shops,
          creditCardInstallments: processedInstallments,
          similarProducts: similarProductsData,
          features
        };

        setFullProduct(fullProductData);
        setSelectedShop(shops[0]);

        // En ucuz mağazayı bul
        const cheapest = [...shops].sort((a, b) => Number(a.indirimli_fiyat) - Number(b.indirimli_fiyat))[0];
        setCheapestShop(cheapest);

        // Eğer seçili mağaza en ucuz değilse, uyarı göster
        if (shops[0].id !== cheapest.id && Number(shops[0].indirimli_fiyat) > Number(cheapest.indirimli_fiyat)) {
          setShowCheapestWarning(true);
        } else {
          setShowCheapestWarning(false);
        }

        // URL'den stok_id parametresi varsa, o mağazayı seç
        if (stokIdParam) {
          const shopWithStokId = shops.find(shop => shop.stok_id === parseInt(stokIdParam));
          if (shopWithStokId) {
            setSelectedShop(shopWithStokId);
          } else {
            setSelectedShop(shops[0]); // Yoksa ilk mağazayı seç
          }
        } else {
          setSelectedShop(shops[0]); // İlk mağazayı varsayılan olarak seç
        }
      } catch (error) {
        console.error('Ürün verisi çekilirken hata oluştu:', error);
        setError('Ürün bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [params.id]);

  const handlePreviousImage = () => {
    if (!fullProduct) return;
    
    const images = getProductImages(fullProduct.product);
    
    setActiveImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    if (!fullProduct) return;
    
    const images = getProductImages(fullProduct.product);
    
    setActiveImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  const handleShopChange = (shop: Shop) => {
    setSelectedShop(shop);
    
    // Seçilen mağaza en ucuz değilse, uyarı göster
    if (cheapestShop && shop.id !== cheapestShop.id && Number(shop.indirimli_fiyat) > Number(cheapestShop.indirimli_fiyat)) {
      setShowCheapestWarning(true);
    } else {
      setShowCheapestWarning(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedShop || !fullProduct) return;

    sepeteEkle({
      id: fullProduct.product.urun_id,
      isim: fullProduct.product.model,
      ebat: `${fullProduct.product.cap_inch} inç`,
      fiyat: Number(selectedShop.indirimli_fiyat),
      adet: quantity,
      resim: fullProduct.product.urun_resmi_0,
      stok_id: selectedShop.stok_id
    });
    
    toast.success('Ürün sepete eklendi');
  };

  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white'; // Sıfır için yeşil
    if (health >= 70) return 'bg-green-500 text-white'; // İyi durum için yeşil
    if (health >= 40) return 'bg-yellow-500 text-white'; // Orta durum için sarı
    return 'bg-red-500 text-white'; // Kötü durum için kırmızı
  };

  const incrementQuantity = () => {
    if (!selectedShop || quantity >= selectedShop.stock) return;
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity <= 1) return;
    setQuantity(prev => prev - 1);
  };

  // Şehre göre filtrelenmiş ve sıralanmış mağazaları al
  const getFilteredAndSortedShops = () => {
    if (!fullProduct) return [];
    
    let filtered = [...fullProduct.shops];
    
    // Şehre göre filtrele
    if (selectedCity !== 'Tümü') {
      filtered = filtered.filter(shop => shop.city === selectedCity);
    }
    
    // Seçilen sıralama seçeneğine göre sırala
    switch (shopSortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.indirimli_fiyat - b.indirimli_fiyat);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.indirimli_fiyat - a.indirimli_fiyat);
        break;
      case 'health-asc':
        filtered.sort((a, b) => a.saglik_durumu - b.saglik_durumu);
        break;
      case 'health-desc':
        filtered.sort((a, b) => b.saglik_durumu - a.saglik_durumu);
        break;
      default:
        filtered.sort((a, b) => a.indirimli_fiyat - b.indirimli_fiyat);
    }
    
    return filtered;
  };
  
  // Gösterilecek mağazaları al (hepsi veya sadece ilk 3)
  const filteredShops = getFilteredAndSortedShops();
  const displayedShops = showAllShops ? filteredShops : filteredShops.slice(0, 3);
  
  // Şehirler listesini al
  const cityOptions = ['Tümü', ...Array.from(new Set(fullProduct?.shops.map(shop => shop.city) || []))];

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/urunler" className="hover:text-primary">Lastikler</Link>
          <span>/</span>
          <Link href={`/urunler?brand=${fullProduct?.product.marka}`} className="hover:text-primary">{fullProduct?.product.marka}</Link>
          <span>/</span>
          <span className="text-gray-300">{fullProduct?.product.model}</span>
        </div>

        <div className="bg-dark-300 rounded-lg shadow-lg overflow-hidden border border-dark-100 mb-6">
          <div className="md:flex">
            {/* Ürün Görselleri */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                {getProductImages(fullProduct?.product)[activeImageIndex] && (
                  <Image 
                    src={getProductImages(fullProduct?.product)[activeImageIndex] || '/placeholder-tire.jpg'}
                    alt={fullProduct?.product?.model || 'Ürün görseli'} 
                    fill
                    priority
                    style={{ objectFit: 'contain' }}
                    className="w-full h-full"
                  />
                )}
                {/* Navigasyon butonları */}
                <button 
                  onClick={handlePreviousImage} 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={handleNextImage} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white"
                >
                  <FaChevronRight />
                </button>
              </div>
              <div className="flex mt-4 gap-2 overflow-x-auto">
                {getProductImages(fullProduct?.product).map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-20 h-20 border rounded-md overflow-hidden cursor-pointer ${activeImageIndex === index ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image 
                      src={image}
                      alt={`${fullProduct?.product.model} - ${index + 1}`} 
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="md:w-1/2 p-6 md:border-l border-dark-100">
              <div className="mb-3">
                <span className="bg-primary text-white text-xs px-2 py-1 rounded">{fullProduct?.product.marka}</span>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">{fullProduct?.product.model}</h1>
              <h2 className="text-lg text-gray-300 mb-4">{fullProduct?.product.cap_inch} inç</h2>

              <div className="flex items-baseline mb-4">
                {selectedShop && Number(selectedShop.indirimli_fiyat) !== Number(selectedShop.fiyat) ? (
                  <>
                    <span className="text-2xl font-bold text-white mr-3">{selectedShop.indirimli_fiyat}₺</span>
                    <span className="text-lg text-gray-400 line-through">{selectedShop.fiyat}₺</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">{selectedShop?.indirimli_fiyat}₺</span>
                )}
              </div>

              {showCheapestWarning && cheapestShop && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-start">
                  <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Daha uygun fiyatlı mağaza mevcut!</p>
                    <p className="text-sm">{cheapestShop.name} ({cheapestShop.city}) bu ürünü <span className="font-bold">{cheapestShop.indirimli_fiyat}₺</span> fiyatla sunuyor.</p>
                    <button 
                      onClick={() => handleShopChange(cheapestShop)}
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Bu mağazaya geç
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Stok Durumu:</span>
                  <span className={`${selectedShop && selectedShop.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedShop && selectedShop.stock > 0 ? `${selectedShop.stock} Adet Stokta` : 'Tükendi'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Lastik Sağlığı:</span>
                  <div className={`inline-block ${getHealthColor(selectedShop?.saglik_durumu || 0)} px-3 py-1 rounded-full text-sm font-medium`}>
                    {selectedShop?.saglik_durumu === 100 ? 'Sıfır' : `%${selectedShop?.saglik_durumu} Sağlık Durumu`}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Mağaza:</span>
                  <div className="text-white flex items-center">
                    <FaStore className="mr-2 text-primary" />
                    {selectedShop?.name}
                    <button 
                      onClick={() => setActiveTab("shops")}
                      className="ml-2 text-sm text-primary hover:text-primary-dark underline"
                    >
                      Mağaza Değiştir
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Şehir:</span>
                  <div className="text-white flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-primary" />
                    {selectedShop?.city}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Montaj Hizmeti:</span>
                  <div className="text-white flex items-center">
                    {selectedShop?.hasMontage ? (
                      <>
                        <FaTools className="mr-2 text-green-500" />
                        <span className="text-green-500">Mevcut</span>
                      </>
                    ) : (
                      <span className="text-red-500">Mevcut Değil</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 w-32">Kargo:</span>
                  <div className="text-white">
                    <div className="flex items-center mb-1">
                      <FaTruck className="mr-2 text-primary" />
                      <span>{selectedShop?.shippingCompanies?.join(', ') || 'Belirtilmemiş'}</span>
                    </div>
                    <p className="text-xs text-gray-400">2-4 iş günü içinde kargoya verilir</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 flex items-center mr-4">
                  <button 
                    onClick={decrementQuantity}
                    className="bg-dark-200 text-white h-10 w-10 flex items-center justify-center rounded-l-md"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div 
                    className="h-10 w-12 bg-dark-200 border-l border-r border-dark-100 flex items-center justify-center text-white"
                  >
                    {quantity}
                  </div>
                  <button 
                    onClick={incrementQuantity}
                    className="bg-dark-200 text-white h-10 w-10 flex items-center justify-center rounded-r-md"
                    disabled={!selectedShop || typeof selectedShop.stock !== 'number' || quantity >= selectedShop.stock}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md transition-colors ${
                    !selectedShop || typeof selectedShop.stock !== 'number' || selectedShop.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedShop || typeof selectedShop.stock !== 'number' || selectedShop.stock < 1}
                >
                  <FaShoppingCart />
                  <span>Sepete Ekle</span>
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Ödeme Seçenekleri</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-dark-200 p-2 rounded-md text-sm text-center text-gray-300">
                    Kredi Kartı
                  </div>
                  <div className="bg-dark-200 p-2 rounded-md text-sm text-center text-gray-300">
                    Taksitli Ödeme
                  </div>
                  <div className="bg-dark-200 p-2 rounded-md text-sm text-center text-gray-300">
                    Havale/EFT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sekme Menüsü */}
        <div className="bg-dark-300 rounded-lg shadow-lg overflow-hidden border border-dark-100 mb-6">
          <div className="border-b border-dark-100">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "description"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Ürün Açıklaması
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "shops"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("shops")}
              >
                Mağazalar
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "installments"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("installments")}
              >
                Kredi Kart Taksitleri
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "terms"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("terms")}
              >
                İptal ve İade Koşulları
              </button>
            </div>
          </div>
          
          {/* Sekme İçerikleri */}
          <div className="p-6">
            {/* Ürün Açıklaması */}
            {activeTab === "description" && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Ürün Açıklaması</h3>
                <div className="bg-dark-200 p-4 rounded-lg mb-6">
                  <p className="text-gray-300 mb-4">
                    {fullProduct?.product.aciklama}
                  </p>

                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                    {fullProduct?.product?.features && fullProduct.product.features.length > 0 ? (
                      fullProduct.product.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center gap-2">
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                        <span>Özellik bilgisi bulunmuyor</span>
                      </li>
                    )}
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-white mb-4">Teknik Özellikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-gray-300 mb-2 font-medium">Lastik Boyutu</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Genişlik</span>
                        <span className="text-white">{fullProduct?.product.genislik_mm} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profil</span>
                        <span className="text-white">{fullProduct?.product.profil}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yapı</span>
                        <span className="text-white">{fullProduct?.product.yapi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Çap</span>
                        <span className="text-white">{fullProduct?.product.cap_inch} inç</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-gray-300 mb-2 font-medium">Performans</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yük Endeksi</span>
                        <span className="text-white">{fullProduct?.product.yuk_endeksi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hız Endeksi</span>
                        <span className="text-white">{fullProduct?.product.hiz_endeksi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mevsim</span>
                        <span className="text-white">{fullProduct?.product.mevsim}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-gray-300 mb-2 font-medium">Genel Özellikler</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Marka</span>
                        <span className="text-white">{fullProduct?.product.marka}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model</span>
                        <span className="text-white">{fullProduct?.product.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sağlık Durumu</span>
                        <span className="text-white">{selectedShop?.saglik_durumu === 100 ? 'Sıfır (Yeni)' : `%${selectedShop?.saglik_durumu}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mağazalar */}
            {activeTab === "shops" && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Mağazalar</h3>
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div className="mb-2 md:mb-0">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-dark-300 text-white border border-dark-100 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="Tümü">Tüm Şehirler</option>
                      {Array.from(new Set(fullProduct?.shops.map(shop => shop.city))).map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={shopSortOption}
                      onChange={(e) => setShopSortOption(e.target.value)}
                      className="bg-dark-300 text-white border border-dark-100 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="price-asc">Fiyat (Artan)</option>
                      <option value="price-desc">Fiyat (Azalan)</option>
                      <option value="health-asc">Sağlık Durumu (Artan)</option>
                      <option value="health-desc">Sağlık Durumu (Azalan)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {displayedShops?.map(shop => (
                    <div 
                      key={shop.id} 
                      className={`bg-dark-300 rounded-lg p-3 border transition-colors ${
                        selectedShop?.id === shop.id ? 'border-primary' : 'border-dark-100'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start">
                        <div className="flex items-start mb-3 md:mb-0 flex-1">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                              shop.saglik_durumu === 100 ? 'bg-green-500' : 
                              shop.saglik_durumu >= 70 ? 'bg-green-500' : 
                              shop.saglik_durumu >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          >
                            <FaStore />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white mb-1">
                              {shop.name}
                              <button
                                onClick={() => handleShopChange(shop)}
                                className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                  selectedShop?.id === shop.id
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-200 text-gray-300 hover:bg-primary hover:text-white'
                                }`}
                              >
                                {selectedShop?.id === shop.id ? 'Seçili' : 'Seç'}
                              </button>
                            </div>
                            <div className="flex items-center text-sm text-gray-400 mb-1">
                              <FaMapMarkerAlt className="mr-1" />
                              <span>{shop.city}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              <span>Sağlık Durumu: {shop.saglik_durumu}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:text-right flex flex-col items-end">
                          <div className="flex items-baseline mb-1 justify-end">
                            {Number(shop.indirimli_fiyat) !== Number(shop.fiyat) ? (
                              <>
                                <div className="text-xl font-bold text-white mr-2">{shop.indirimli_fiyat}₺</div>
                                <div className="text-sm text-gray-400 line-through">{shop.fiyat}₺</div>
                              </>
                            ) : (
                              <div className="text-xl font-bold text-white pl-5">{shop.indirimli_fiyat}₺</div>
                            )}
                          </div>
                          <div className="text-sm mb-2">
                            <span className={`${shop.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {shop.stock > 0 ? `${shop.stock} Adet Stokta` : 'Tükendi'}
                            </span>
                          </div>
                          {shop.hasMontage && (
                            <div className="flex items-center justify-end text-sm text-green-500">
                              <FaTools className="mr-1" />
                              <span>Montaj Hizmeti</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredShops && filteredShops.length > 3 && !showAllShops && (
                    <button
                      className="w-full py-2 text-primary hover:text-primary-dark text-center"
                      onClick={() => setShowAllShops(true)}
                    >
                      Tüm Mağazaları Göster ({filteredShops.length})
                    </button>
                  )}

                  {showAllShops && (
                    <button
                      className="w-full py-2 text-primary hover:text-primary-dark text-center"
                      onClick={() => setShowAllShops(false)}
                    >
                      Daha Az Göster
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Kredi Kart Taksitleri */}
            {activeTab === "installments" && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Kredi Kart Taksitleri</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {fullProduct?.creditCardInstallments.map((bank, index) => (
                    <div key={index} className="bg-dark-200 rounded-lg overflow-hidden h-full">
                      <div className="bg-dark-100 py-2 px-4 flex items-center mb-1">
                        <h4 className="text-white font-medium">{bank.bank}</h4>
                      </div>
                      <div className="overflow-x-auto p-2">
                        <table className="min-w-full divide-y divide-dark-100">
                          <thead className="bg-dark-300">
                            <tr>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Taksit
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Taksit Tutarı
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Toplam Tutar
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-dark-200 divide-y divide-dark-100">
                            <tr className="bg-dark-200">
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                Tek Çekim
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                {selectedShop?.indirimli_fiyat ? selectedShop.indirimli_fiyat.toFixed(2) : "0.00"} TL
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                {selectedShop?.indirimli_fiyat ? selectedShop.indirimli_fiyat.toFixed(2) : "0.00"} TL
                              </td>
                            </tr>
                            {bank.rates.filter((rate, idx) => idx !== 0).map((rate, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-dark-200' : 'bg-dark-300'}>
                                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                  {rate.installments}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                  {rate.price ? `${rate.price.toFixed(2)} TL` : '-'}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                  {rate.total ? `${rate.total.toFixed(2)} TL` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  
                  {/* Diğer Taksit Seçeneği */}
                  <div className="bg-dark-200 rounded-lg overflow-hidden h-full">
                    <div className="bg-dark-100 py-2 px-4 flex items-center mb-1">
                      <h4 className="text-white font-medium">Diğer</h4>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="min-w-full divide-y divide-dark-100">
                        <thead className="bg-dark-300">
                          <tr>
                            <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Taksit
                            </th>
                            <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Taksit Tutarı
                            </th>
                            <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Toplam Tutar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-dark-200 divide-y divide-dark-100">
                          <tr className="bg-dark-200">
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                              Tek Çekim
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                              {selectedShop?.indirimli_fiyat ? selectedShop.indirimli_fiyat.toFixed(2) : "0.00"} TL
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                              {selectedShop?.indirimli_fiyat ? selectedShop.indirimli_fiyat.toFixed(2) : "0.00"} TL
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="bg-dark-200 text-gray-300 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Önemli Not</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Vade tutarları ortalama değerlerdir, ödeme adımında değişkenlik gösterebilir.</li>
                    <li>Bazı vade tutarları ortalama değerlerdir, ödeme adımında ürünlerin KDV'lerinin farklılıklarından dolayı değişkenlik gösterebilir.</li>
                    <li>Vade tutarları, ödeme adımında satıcı bazlı değişkenlik gösterebilir.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* İptal ve İade Koşulları */}
            {activeTab === "terms" && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">İptal ve İade Koşulları</h3>
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-white mb-3">İade ve Değişim Politikası</h4>
                  <p className="text-gray-300 mb-4">
                    Satın aldığınız lastiklerde memnuniyetsizlik durumunda, 7 gün içinde iade veya değişim talep edebilirsiniz. İade için lastiklerin kullanılmamış ve orijinal durumunda olması gerekmektedir.
                  </p>
                  
                  <h4 className="text-lg font-medium text-white mb-3">Teslimat ve Montaj Bilgisi</h4>
                  <p className="text-gray-300 mb-4">
                    Sipariş ettiğiniz lastikler 2-4 iş günü içinde adresinize teslim edilir. Ayrıca, belirli bölgelerde montaj desteği sağlanmaktadır. Daha fazla bilgi için bizimle iletişime geçebilirsiniz.
                  </p>
                  
                  <h4 className="text-lg font-medium text-white mb-3">Gizlilik Politikası</h4>
                  <p className="text-gray-300">
                    Lastik analiz verileriniz ve kişisel bilgileriniz tamamen gizli tutulur. Veriler yalnızca analiz hizmetlerimizi geliştirmek ve sipariş süreçlerini yönetmek için kullanılır.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benzer Ürünler */}
        <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarProducts.map((similarProduct) => (
              <div 
                key={similarProduct.urun_id} 
                className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01] flex flex-col h-full"
              >
                <div className="relative">
                  <Link href={`/urun-detay/${similarProduct.urun_id}`}>
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      <Image
                        src={similarProduct.urun_resmi_0 || "/placeholder-tire.jpg"}
                        alt={similarProduct.model}
                        width={200}
                        height={200}
                        className="object-contain w-full h-full"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  </Link>
                  <div className={`absolute top-2 left-2 ${getHealthColor(similarProduct.saglik_durumu)} px-2 py-1 rounded text-xs`}>
                    {similarProduct.saglik_durumu === 100 ? 'Sıfır' : `%${similarProduct.saglik_durumu}`}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/urun-detay/${similarProduct.urun_id}`}>
                      <h3 className="text-lg font-medium text-white hover:text-primary transition-colors">
                        {similarProduct.model}
                      </h3>
                    </Link>
                    <span className="bg-primary px-2 py-1 rounded text-xs text-white">
                      {similarProduct.marka}
                    </span>
                  </div>
                  
                  {/* Sabit İnç ve Mevsim Bilgisi */}
                  <div className="mb-2 text-sm text-gray-400 h-6">
                    {similarProduct.cap_inch} inç | {similarProduct.mevsim}
                  </div>
                  
                  {/* Sabit Mağaza Bilgileri */}
                  <div className="mb-3 h-14">
                    <div className="text-gray-300 text-sm truncate">
                      {similarProduct.magaza_isim}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {similarProduct.magaza_sehir}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline mb-3">
                    {Number(similarProduct.indirimli_fiyat) !== Number(similarProduct.fiyat) ? (
                      <>
                        <span className="text-xl font-bold text-white mr-2">
                          {similarProduct.indirimli_fiyat}₺
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {similarProduct.fiyat}₺
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {similarProduct.indirimli_fiyat}₺
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <Link
                      href={`/urun-detay/${similarProduct.urun_id}`}
                      className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md flex items-center justify-center transition-colors"
                    >
                      Ürüne Git
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 