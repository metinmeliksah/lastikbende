'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaTruck, FaTools, FaStore, FaMapMarkerAlt, FaCheckCircle, FaStar, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ürün veri tipi tanımla
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
  features?: string[];
  urun_resmi_0: string;
  urun_resmi_1?: string;
  urun_resmi_2?: string;
  urun_resmi_3?: string;
  price?: number;           // For display compatibility
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
  price: number;
  stock: number;
  hasMontage: boolean;
  shippingCompanies: string[];
  rating: number;
}

// Kredi kartı taksit veri tipi tanımla
interface CreditCardInstallment {
  bank: string;
  rates: {
    installments: number;
    price: number;
    total: number;
  }[];
}

// Tam ürün veri tipi tanımla
interface FullProduct {
  product: ProductData;
  shops: Shop[];
  creditCardInstallments: CreditCardInstallment[];
  similarProducts: SimilarProduct[];
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
    price: 1299,
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
    price: 1199,
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
    price: 1399,
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
    price: 1599,
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

export default function UrunDetayPage({ params }: { params: { id: string } }) {
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

  // Ürün verilerini Supabase'den çek
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        console.log("Ürün verileri çekiliyor, ID:", params.id);
        
        // Ürün detaylarını çek
        const { data: productData, error: productError } = await supabase
          .from('urundetay')
          .select('*')
          .eq('urun_id', params.id)
          .single();

        if (productError) {
          console.error("Ürün verisi çekilirken hata:", productError);
          throw productError;
        }
        
        if (!productData) {
          console.error("Ürün bulunamadı");
          throw new Error('Ürün bulunamadı');
        }
        
        console.log("Ürün verisi başarıyla çekildi:", productData.model);

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
              .select('*')
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
              price: stock.fiyat,
              stock: stock.stok_adet,
              hasMontage: hasMontage,
              shippingCompanies: shippingCompanies.length > 0 ? shippingCompanies : ['Belirtilmemiş'],
              rating: sellerData.rating || 4.5
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
          if (productData.features && typeof productData.features === 'string') {
            features = JSON.parse(productData.features);
          } else if (Array.isArray(productData.features)) {
            features = productData.features;
          }
        } catch (e) {
          console.error("Ürün özellikleri ayrıştırılırken hata:", e);
          features = [];
        }

        // Benzer ürünleri çek (önce aynı inç ve mevsim, sonra sadece inç, en son sadece mevsim)
        const fetchSimilarProducts = async () => {
          try {
            // Önce aynı inç ve mevsim olan ürünleri çek
            const { data: sameSizeAndSeason, error: sssError } = await supabase
              .from('urundetay')
              .select('*')
              .eq('cap_inch', productData.cap_inch)
              .eq('mevsim', productData.mevsim)
              .neq('urun_id', productData.urun_id)
              .limit(4);
              
            // Sonra aynı inç olan ürünleri çek
            const { data: sameSize, error: ssError } = await supabase
              .from('urundetay')
              .select('*')
              .eq('cap_inch', productData.cap_inch)
              .neq('mevsim', productData.mevsim)
              .neq('urun_id', productData.urun_id)
              .limit(4);
              
            // Son olarak aynı mevsim olan ürünleri çek
            const { data: sameSeason, error: sError } = await supabase
              .from('urundetay')
              .select('*')
              .eq('mevsim', productData.mevsim)
              .neq('cap_inch', productData.cap_inch)
              .neq('urun_id', productData.urun_id)
              .limit(4);

            // En fazla 4 benzer ürün gösterilecek, öncelik sırası ile
            let similarProductsRaw: any[] = [];
            
            if (sameSizeAndSeason && sameSizeAndSeason.length > 0) {
              similarProductsRaw = [...sameSizeAndSeason];
            }
            
            if (similarProductsRaw.length < 4 && sameSize && sameSize.length > 0) {
              similarProductsRaw = [...similarProductsRaw, ...sameSize];
            }
            
            if (similarProductsRaw.length < 4 && sameSeason && sameSeason.length > 0) {
              similarProductsRaw = [...similarProductsRaw, ...sameSeason];
            }
            
            // Benzer ürünleri en fazla 4 tane olacak şekilde kes
            similarProductsRaw = similarProductsRaw.slice(0, 4);
            
            // Fiyat ve stok bilgilerini çek
            const processedSimilarProducts = await Promise.all(
              similarProductsRaw.map(async (product) => {
                // Stok bilgisini çek
                const { data: stockData, error: stockError } = await supabase
                  .from('stok')
                  .select('*')
                  .eq('urun_id', product.urun_id)
                  .limit(1);

                if (stockError || !stockData || stockData.length === 0) {
                  return null;
                }

                // İlk stok bilgisini al
                const stock = stockData[0];

                // Mağaza bilgisini çek
                const { data: sellerData, error: sellerError } = await supabase
                  .from('sellers')
                  .select('id, isim, sehir')
                  .eq('id', stock.magaza_id)
                  .single();

                if (sellerError || !sellerData) {
                  return null;
                }

                // Benzer ürün bilgilerini döndür
                return {
                  urun_id: product.urun_id,
                  model: product.model,
                  marka: product.marka,
                  cap_inch: product.cap_inch,
                  mevsim: product.mevsim,
                  saglik_durumu: product.saglik_durumu,
                  urun_resmi_0: product.urun_resmi_0,
                  fiyat: stock.fiyat,
                  indirimli_fiyat: stock.indirimli_fiyat || stock.fiyat,
                  stok: stock.stok_adet,
                  magaza_isim: sellerData.isim,
                  magaza_sehir: sellerData.sehir
                };
              })
            );
            
            // Null değerlerini filtrele
            return processedSimilarProducts.filter((product): product is SimilarProduct => product !== null);
          } catch (err) {
            console.error("Benzer ürünler çekilirken hata:", err);
            return [];
          }
        };

        const similarProductsData = await fetchSimilarProducts();
        
        console.log(`${similarProductsData.length} adet benzer ürün bulundu`);

        // Kredi kartı taksit bilgileri (örnek veri - gerçek uygulamada bunlar da veritabanından gelebilir)
        const creditCardInstallments = [
          {
            bank: 'Maximum',
            rates: [
              { installments: 1, price: Math.round(shops[0].price), total: Math.round(shops[0].price) },
              { installments: 2, price: Math.round(shops[0].price * 1.05 / 2), total: Math.round(shops[0].price * 1.05) },
              { installments: 3, price: Math.round(shops[0].price * 1.08 / 3), total: Math.round(shops[0].price * 1.08) },
              { installments: 6, price: Math.round(shops[0].price * 1.12 / 6), total: Math.round(shops[0].price * 1.12) },
              { installments: 9, price: Math.round(shops[0].price * 1.15 / 9), total: Math.round(shops[0].price * 1.15) },
              { installments: 12, price: Math.round(shops[0].price * 1.18 / 12), total: Math.round(shops[0].price * 1.18) }
            ]
          },
          {
            bank: 'Axess',
            rates: [
              { installments: 1, price: Math.round(shops[0].price), total: Math.round(shops[0].price) },
              { installments: 2, price: Math.round(shops[0].price * 1.04 / 2), total: Math.round(shops[0].price * 1.04) },
              { installments: 3, price: Math.round(shops[0].price * 1.07 / 3), total: Math.round(shops[0].price * 1.07) },
              { installments: 6, price: Math.round(shops[0].price * 1.10 / 6), total: Math.round(shops[0].price * 1.10) },
              { installments: 9, price: Math.round(shops[0].price * 1.13 / 9), total: Math.round(shops[0].price * 1.13) },
              { installments: 12, price: Math.round(shops[0].price * 1.16 / 12), total: Math.round(shops[0].price * 1.16) }
            ]
          }
        ];

        // Tam ürün verisi oluştur
        const fullProductData: FullProduct = {
          product: {
            ...productData,
            features
          },
          shops,
          creditCardInstallments,
          similarProducts: similarProductsData
        };

        setFullProduct(fullProductData);
        setSelectedShop(shops[0]);
        setSimilarProducts(similarProductsData);

        // En ucuz mağazayı bul
        const cheapest = [...shops].sort((a, b) => a.price - b.price)[0];
        setCheapestShop(cheapest);

        // Eğer seçili mağaza en ucuz değilse, uyarı göster
        if (shops[0].id !== cheapest.id) {
          setShowCheapestWarning(true);
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
    if (cheapestShop && shop.id !== cheapestShop.id && shop.price > cheapestShop.price) {
      setShowCheapestWarning(true);
    } else {
      setShowCheapestWarning(false);
    }
  };

  const handleAddToCart = () => {
    // Sepete ekleme işlemi
    alert(`${quantity} adet ${fullProduct?.product.model} sepete eklendi. Mağaza: ${selectedShop?.name} (${selectedShop?.city})`);
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

  const cities = ['Tümü', ...Array.from(new Set(fullProduct?.shops.map(shop => shop.city) || []))];

  const filteredShops = selectedCity === 'Tümü' 
    ? fullProduct?.shops 
    : fullProduct?.shops.filter(shop => shop.city === selectedCity);

  const displayedShops = showAllShops ? filteredShops : filteredShops?.slice(0, 3);

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
              <div className="relative h-96 border border-gray-200 rounded-lg overflow-hidden">
                {getProductImages(fullProduct?.product)[activeImageIndex] && (
                  <Image 
                    src={getProductImages(fullProduct?.product)[activeImageIndex] || '/placeholder-tire.jpg'}
                    alt={fullProduct?.product?.model || 'Ürün görseli'} 
                    fill
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
                {fullProduct?.product.discountedPrice ? (
                  <>
                    <span className="text-2xl font-bold text-white mr-3">{selectedShop?.price}₺</span>
                    <span className="text-lg text-gray-400 line-through">{fullProduct.product.price}₺</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">{selectedShop?.price}₺</span>
                )}
              </div>

              {showCheapestWarning && cheapestShop && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-start">
                  <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Daha uygun fiyatlı mağaza mevcut!</p>
                    <p className="text-sm">{cheapestShop.name} ({cheapestShop.city}) bu ürünü <span className="font-bold">{cheapestShop.price}₺</span> fiyatla sunuyor.</p>
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
                  <span className="text-white">{fullProduct?.product.saglik_durumu === 100 ? 'Sıfır (Yeni)' : `%${fullProduct?.product.saglik_durumu}`}</span>
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
                    {fullProduct?.product.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-primary mt-1 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
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
                        <span className="text-white">{fullProduct?.product.saglik_durumu === 100 ? 'Sıfır (Yeni)' : `%${fullProduct?.product.saglik_durumu}`}</span>
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
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cities.map(city => (
                      <button
                        key={city}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedCity === city 
                            ? 'bg-primary text-white' 
                            : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
                        }`}
                        onClick={() => setSelectedCity(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {displayedShops?.map(shop => (
                      <div 
                        key={shop.id}
                        className={`bg-dark-200 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedShop?.id === shop.id ? 'border-primary' : 'border-transparent hover:border-gray-700'
                        }`}
                        onClick={() => handleShopChange(shop)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-3 md:mb-0">
                            <div className="flex items-center mb-2">
                              <FaStore className="text-primary mr-2" />
                              <h4 className="font-medium text-white">{shop.name}</h4>
                            </div>
                            <div className="flex items-start text-sm text-gray-400 mb-2">
                              <FaMapMarkerAlt className="mr-2 mt-0.5 flex-shrink-0" />
                              <span>{shop.city}, {shop.address}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <div className="flex items-center text-yellow-400 mr-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <FaStar key={i} className={i < Math.floor(shop.rating) ? 'text-yellow-400' : 'text-gray-600'} />
                                ))}
                              </div>
                              <span className="text-gray-300">{shop.rating}</span>
                            </div>
                          </div>
                          <div className="md:text-right">
                            <div className="text-xl font-bold text-white mb-1">{shop.price}₺</div>
                            <div className={`text-sm ${shop.stock > 0 ? 'text-green-500' : 'text-red-500'} mb-2`}>
                              {shop.stock > 0 ? `${shop.stock} Adet Stokta` : 'Tükendi'}
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
                                1
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                {selectedShop?.price.toFixed(2)} TL
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                {selectedShop?.price.toFixed(2)} TL
                              </td>
                            </tr>
                            {bank.rates.map((rate, idx) => (
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
            {/* Benzer Ürün Kartları - İlk 4 ürünü gösteriyoruz */}
            {similarProducts.slice(0, 4).map((similarProduct) => (
              <div 
                key={similarProduct.urun_id} 
                className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01]"
              >
                <div className="relative">
                  <Link href={`/urun-detay/${similarProduct.urun_id}`}>
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      <Image
                        src="/placeholder-tire.jpg"
                        alt={similarProduct.model}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                  </Link>
                  <div className={`absolute top-2 left-2 ${getHealthColor(similarProduct.saglik_durumu).split(' ').slice(0, 2).join(' ')} px-2 py-1 rounded text-xs`}>
                    {similarProduct.saglik_durumu === 100 ? 'Sıfır' : `%${similarProduct.saglik_durumu}`}
                  </div>
                </div>
                <div className="p-4">
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
                  <div className="mb-2 text-sm text-gray-400">
                    {similarProduct.cap_inch} | {similarProduct.mevsim}
                  </div>
                  <div className="flex flex-col mb-3">
                    <div className="text-gray-300 text-sm truncate">
                      {similarProduct.magaza_isim}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {similarProduct.magaza_sehir}
                    </div>
                  </div>
                  <div className="flex items-baseline mb-3">
                    {similarProduct.indirimli_fiyat ? (
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
                        {similarProduct.fiyat}₺
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${similarProduct.stok > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {similarProduct.stok > 0 ? 'Stokta' : 'Tükendi'}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/urun-detay/${similarProduct.urun_id}`}
                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Detaylar
                      </Link>
                    </div>
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