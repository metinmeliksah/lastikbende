'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaTruck, FaTools, FaStore, FaMapMarkerAlt, FaCheckCircle, FaStar, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

// Örnek ürün verileri
const productData = {
  id: 1,
  name: 'Lastik Test 1',
  brand: 'Michelin',
  model: 'Pilot Sport 4',
  price: 999,
  discountedPrice: 899,
  images: [
    '/placeholder-tire.jpg',
    '/placeholder-tire.jpg',
    '/placeholder-tire.jpg',
  ],
  health: 60,
  size: '16 inç',
  width: '205',
  aspectRatio: '55',
  construction: 'R',
  diameter: '16',
  season: 'Yaz',
  loadIndex: '91',
  speedIndex: 'V',
  features: [
    'Yüksek hızlarda mükemmel yol tutuş',
    'Islak zeminde gelişmiş fren performansı',
    'Düşük yuvarlanma direnci ile yakıt tasarrufu',
    'Uzun lastik ömrü',
    'Sessiz ve konforlu sürüş deneyimi'
  ],
  description: 'Bu lastik, %60 sağlık durumu ile hala güvenli ve verimli bir sürüş deneyimi sunmaktadır. Orta seviyedeki aşınma durumu, günlük kullanım ve şehir içi sürüşler için uygun olmasını sağlar. Performansını artırmak ve ömrünü uzatmak için düzenli bakım önerilir. Ekonomik bir seçenek arayanlar için ideal bir tercih!',
  stock: 10,
  shops: [
    {
      id: 1,
      name: 'Lassa Lastik Satış A.Ş.',
      city: 'Elazığ',
      address: 'Cumhuriyet Mah. 35/A',
      price: 899,
      stock: 10,
      hasMontage: true,
      shippingMethods: ['Aras Kargo', 'MNG Kargo'],
      rating: 4.7
    },
    {
      id: 2,
      name: 'Lassa Lastik Satış A.Ş.',
      city: 'İstanbul',
      address: 'Kadıköy, Bağdat Cad. 121/B',
      price: 849,
      stock: 5,
      hasMontage: true,
      shippingMethods: ['Yurtiçi Kargo'],
      rating: 4.5
    },
    {
      id: 3,
      name: 'Lassa Lastik Satış A.Ş.',
      city: 'Ankara',
      address: 'Çankaya, Atatürk Bulvarı 78',
      price: 929,
      stock: 8,
      hasMontage: true,
      shippingMethods: ['MNG Kargo', 'PTT Kargo'],
      rating: 4.8
    }
  ],
  creditCardInstallments: [
    {
      bank: 'Maximum',
      rates: [
        { installments: 2, price: 1268.49, total: 2536.97 },
        { installments: 3, price: 927.18, total: 2781.53 },
        { installments: 4, price: 736.48, total: 2945.93 },
        { installments: 5, price: 604.36, total: 3021.78 },
        { installments: 6, price: 516.23, total: 3097.39 },
        { installments: 9, price: 369.86, total: 3328.76 },
        { installments: 12, price: 302.70, total: 3632.43 }
      ]
    },
    {
      bank: 'Axess',
      rates: [
        { installments: 2, price: 1268.49, total: 2536.97 },
        { installments: 3, price: 845.66, total: 2536.97 },
        { installments: 6, price: 463.00, total: 2777.98 },
        { installments: 9, price: 370.68, total: 3336.12 },
        { installments: 12, price: 304.44, total: 3653.24 }
      ]
    },
    {
      bank: 'QNB',
      rates: [
        { installments: 2, price: 1268.49, total: 2536.97 },
        { installments: 3, price: 845.66, total: 2536.97 },
        { installments: 6, price: 497.46, total: 2984.75 },
        { installments: 9, price: 355.74, total: 3201.66 },
        { installments: 12, price: 278.64, total: 3343.73 }
      ]
    }
  ]
};

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
  const [product, setProduct] = useState(productData);
  const [selectedShop, setSelectedShop] = useState(productData.shops[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [showAllShops, setShowAllShops] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [cheapestShop, setCheapestShop] = useState<typeof selectedShop | null>(null);
  const [showCheapestWarning, setShowCheapestWarning] = useState(false);

  // Gerçek uygulamada, ürün verilerini API'den çekeceksiniz
  useEffect(() => {
    // Bu kısım API entegrasyonu için
    // const fetchProduct = async () => {
    //   const response = await fetch(`/api/products/${params.id}`);
    //   const data = await response.json();
    //   setProduct(data);
    //   setSelectedShop(data.shops[0]);
    // };
    // fetchProduct();
    
    // En ucuz mağazayı bul
    const cheapest = [...product.shops].sort((a, b) => a.price - b.price)[0];
    setCheapestShop(cheapest);
  }, [params.id, product.shops]);

  const handlePreviousImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex < product.images.length - 1 ? prevIndex + 1 : 0));
  };

  const handleShopChange = (shop: typeof selectedShop) => {
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
    alert(`${quantity} adet ${product.name} sepete eklendi. Mağaza: ${selectedShop.name} (${selectedShop.city})`);
  };

  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white'; // Sıfır için yeşil
    if (health >= 70) return 'bg-green-500 text-white'; // İyi durum için yeşil
    if (health >= 40) return 'bg-yellow-500 text-white'; // Orta durum için sarı
    return 'bg-red-500 text-white'; // Kötü durum için kırmızı
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, selectedShop.stock));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const cities = ['Tümü', ...Array.from(new Set(product.shops.map(shop => shop.city)))];

  const filteredShops = selectedCity === 'Tümü' 
    ? product.shops 
    : product.shops.filter(shop => shop.city === selectedCity);

  const displayedShops = showAllShops ? filteredShops : filteredShops.slice(0, 3);

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/urunler" className="hover:text-primary">Lastikler</Link>
          <span>/</span>
          <Link href={`/urunler?brand=${product.brand}`} className="hover:text-primary">{product.brand}</Link>
          <span>/</span>
          <span className="text-gray-300">{product.name}</span>
        </div>

        <div className="bg-dark-300 rounded-lg shadow-lg overflow-hidden border border-dark-100 mb-6">
          <div className="md:flex">
            {/* Ürün Görselleri */}
            <div className="md:w-1/2 p-6">
              <div className="relative aspect-square bg-dark-200 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.images[activeImageIndex]}
                  alt={`${product.name} - Görsel ${activeImageIndex + 1}`}
                  className="object-contain"
                  fill
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button 
                    onClick={handlePreviousImage}
                    className="bg-dark-300 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="bg-dark-300 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                <div className={`absolute top-2 left-2 ${getHealthColor(product.health)} px-2 py-1 rounded text-sm`}>
                  {product.health === 100 ? 'Sıfır' : `%${product.health} Sağlık`}
                </div>
              </div>

              <div className="flex overflow-x-auto space-x-2 pb-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                      activeImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={image}
                        alt={`${product.name} - Küçük Görsel ${index + 1}`}
                        className="object-contain"
                        fill
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="md:w-1/2 p-6 md:border-l border-dark-100">
              <div className="mb-3">
                <span className="bg-primary text-white text-xs px-2 py-1 rounded">{product.brand}</span>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">{product.name}</h1>
              <h2 className="text-lg text-gray-300 mb-4">{product.model}</h2>

              <div className="flex items-baseline mb-4">
                {product.discountedPrice ? (
                  <>
                    <span className="text-2xl font-bold text-white mr-3">{selectedShop.price}₺</span>
                    <span className="text-lg text-gray-400 line-through">{product.price}₺</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">{selectedShop.price}₺</span>
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
                  <span className={`${selectedShop.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedShop.stock > 0 ? `${selectedShop.stock} Adet Stokta` : 'Tükendi'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Lastik Sağlığı:</span>
                  <span className="text-white">{product.health === 100 ? 'Sıfır (Yeni)' : `%${product.health}`}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Mağaza:</span>
                  <div className="text-white flex items-center">
                    <FaStore className="mr-2 text-primary" />
                    {selectedShop.name}
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
                    {selectedShop.city}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Montaj Hizmeti:</span>
                  <div className="text-white flex items-center">
                    {selectedShop.hasMontage ? (
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
                      <span>{selectedShop.shippingMethods.join(', ')}</span>
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
                    disabled={quantity >= selectedShop.stock}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md transition-colors ${
                    selectedShop.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={selectedShop.stock < 1}
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
                    {product.description}
                  </p>

                  <h4 className="text-lg font-medium text-white mb-2">Özellikler</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                    {product.features.map((feature, index) => (
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
                        <span className="text-white">{product.width} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profil</span>
                        <span className="text-white">{product.aspectRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yapı</span>
                        <span className="text-white">{product.construction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Çap</span>
                        <span className="text-white">{product.diameter} inç</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-gray-300 mb-2 font-medium">Performans</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yük Endeksi</span>
                        <span className="text-white">{product.loadIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hız Endeksi</span>
                        <span className="text-white">{product.speedIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mevsim</span>
                        <span className="text-white">{product.season}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-gray-300 mb-2 font-medium">Genel Özellikler</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Marka</span>
                        <span className="text-white">{product.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model</span>
                        <span className="text-white">{product.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sağlık Durumu</span>
                        <span className="text-white">{product.health === 100 ? 'Sıfır (Yeni)' : `%${product.health}`}</span>
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
                    {displayedShops.map(shop => (
                      <div 
                        key={shop.id}
                        className={`bg-dark-200 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedShop.id === shop.id ? 'border-primary' : 'border-transparent hover:border-gray-700'
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

                    {filteredShops.length > 3 && !showAllShops && (
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
                  {product.creditCardInstallments.map((bank, index) => (
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
                                {selectedShop.price.toFixed(2)} TL
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                                {selectedShop.price.toFixed(2)} TL
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
            {dummyProducts.slice(0, 4).map((similarProduct) => (
              <div 
                key={similarProduct.id} 
                className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01]"
              >
                <div className="relative">
                  <Link href={`/urun-detay/${similarProduct.id}`}>
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      <Image
                        src="/placeholder-tire.jpg"
                        alt={similarProduct.name}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                  </Link>
                  <div className={`absolute top-2 left-2 ${getHealthColor(similarProduct.health).split(' ').slice(0, 2).join(' ')} px-2 py-1 rounded text-xs`}>
                    {similarProduct.health === 100 ? 'Sıfır' : `%${similarProduct.health}`}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/urun-detay/${similarProduct.id}`}>
                      <h3 className="text-lg font-medium text-white hover:text-primary transition-colors">
                        {similarProduct.name}
                      </h3>
                    </Link>
                    <span className="bg-primary px-2 py-1 rounded text-xs text-white">
                      {similarProduct.brand}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-400">
                    {similarProduct.size} | {similarProduct.season}
                  </div>
                  <div className="flex flex-col mb-3">
                    <div className="text-gray-300 text-sm truncate">
                      {similarProduct.shop}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {similarProduct.city}
                    </div>
                  </div>
                  <div className="flex items-baseline mb-3">
                    {similarProduct.discountedPrice ? (
                      <>
                        <span className="text-xl font-bold text-white mr-2">
                          {similarProduct.discountedPrice}₺
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {similarProduct.price}₺
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {similarProduct.price}₺
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${similarProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {similarProduct.stock > 0 ? 'Stokta' : 'Tükendi'}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/urun-detay/${similarProduct.id}`}
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