'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaTrash, FaMinus, FaPlus, FaTruck, FaMapMarkerAlt, FaCreditCard, FaStore, FaBox } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Il {
  id: number
  isim: string
}

interface Ilce {
  id: number
  il_id: number
  isim: string
}

interface Magaza {
  id: number
  isim: string
  adres: string
}

interface Ilceler {
  [key: number]: Ilce[]
}

interface Magazalar {
  [key: string]: Magaza[]
}

export default function SepetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, removeFromCart, updateQuantity, subtotal, shipping, total } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  // Örnek il ve ilçe verileri
  const [iller] = useState<Il[]>([
    { id: 1, isim: "İstanbul" },
    { id: 2, isim: "Ankara" },
    { id: 3, isim: "İzmir" }
  ])

  const [ilceler] = useState<Ilce[]>([
    { id: 1, il_id: 1, isim: "Kadıköy" },
    { id: 2, il_id: 1, isim: "Beşiktaş" },
    { id: 3, il_id: 1, isim: "Üsküdar" },
    { id: 4, il_id: 1, isim: "Ataşehir" },
    { id: 5, il_id: 1, isim: "Maltepe" },
    { id: 6, il_id: 2, isim: "Çankaya" },
    { id: 7, il_id: 2, isim: "Keçiören" },
    { id: 8, il_id: 2, isim: "Mamak" },
    { id: 9, il_id: 2, isim: "Yenimahalle" },
    { id: 10, il_id: 2, isim: "Etimesgut" },
    { id: 11, il_id: 3, isim: "Konak" },
    { id: 12, il_id: 3, isim: "Karşıyaka" },
    { id: 13, il_id: 3, isim: "Bornova" },
    { id: 14, il_id: 3, isim: "Buca" },
    { id: 15, il_id: 3, isim: "Çiğli" }
  ])

  // Örnek mağaza verileri
  const [magazalar] = useState<Magazalar>({
    "1-1": [
      { id: 1, isim: "Kadıköy Mağazası", adres: "Bağdat Caddesi No:123" },
      { id: 2, isim: "Moda Mağazası", adres: "Moda Caddesi No:45" }
    ],
    "1-2": [
      { id: 3, isim: "Beşiktaş Mağazası", adres: "Barbaros Bulvarı No:67" }
    ],
    "2-1": [
      { id: 4, isim: "Çankaya Mağazası", adres: "Tunalı Hilmi Caddesi No:89" }
    ],
    "3-1": [
      { id: 5, isim: "Konak Mağazası", adres: "Gazi Bulvarı No:101" }
    ]
  })

  // Örnek adres verileri
  const [adresler] = useState([
    {
      id: 1,
      baslik: "Ev",
      isim: "Ahmet Yılmaz",
      adres: "Atatürk Mahallesi, Cumhuriyet Caddesi No:1 D:2",
      sehir: "İstanbul",
      telefon: "0555 123 4567"
    },
    {
      id: 2,
      baslik: "İş",
      isim: "Ahmet Yılmaz",
      adres: "Levent Plaza, Büyükdere Caddesi No:100 Kat:5",
      sehir: "İstanbul",
      telefon: "0555 123 4567"
    }
  ])

  const [secilenTeslimatAdresi, setSecilenTeslimatAdresi] = useState<number | null>(null)
  const [secilenFaturaAdresi, setSecilenFaturaAdresi] = useState<number | null>(null)
  const [faturaAdresiAyni, setFaturaAdresiAyni] = useState(false)
  const [teslimatTipi, setTeslimatTipi] = useState('magaza')
  const [secilenIl, setSecilenIl] = useState<number | null>(null)
  const [secilenIlce, setSecilenIlce] = useState<number | null>(null)
  const [secilenMagaza, setSecilenMagaza] = useState<number | null>(null)

  // Fatura adresi değiştiğinde kontrol
  const handleFaturaAdresiChange = (adresId: number) => {
    setSecilenFaturaAdresi(adresId)
    if (faturaAdresiAyni) {
      setSecilenTeslimatAdresi(adresId)
    }
  }

  // Teslimat adresi değiştiğinde kontrol
  const handleTeslimatAdresiChange = (adresId: number) => {
    setSecilenTeslimatAdresi(adresId)
    if (faturaAdresiAyni) {
      setSecilenFaturaAdresi(adresId)
    }
  }

  // Fatura adresi aynı seçeneği değiştiğinde
  const handleFaturaAdresiAyniChange = (checked: boolean) => {
    setFaturaAdresiAyni(checked)
    if (checked && secilenTeslimatAdresi) {
      setSecilenFaturaAdresi(secilenTeslimatAdresi)
    }
  }

  const handleSiparisOnayla = () => {
    if (!user) {
      toast.error('Sipariş vermek için giriş yapmalısınız');
      router.push('/giris');
      return;
    }

    // Teslimat tipine göre validasyon
    if (teslimatTipi === 'magaza' && (!secilenMagaza || !secilenFaturaAdresi)) {
      toast.error('Lütfen mağaza ve fatura adresi seçiniz.');
      return;
    }

    if (teslimatTipi === 'adres' && (!secilenTeslimatAdresi || !secilenFaturaAdresi)) {
      toast.error('Lütfen teslimat ve fatura adresi seçiniz.');
      return;
    }

    // Sepet verilerini localStorage'a kaydet
    const sepetVerisi = {
      urunler: items,
      toplamTutar: subtotal,
      kargo: shipping,
      genelToplam: total,
      teslimatBilgileri: {
        tip: teslimatTipi,
        magaza: teslimatTipi === 'magaza' ? magazalar[`${secilenIl}-${secilenIlce}`]?.find(m => m.id === secilenMagaza) : null,
        teslimatAdresi: teslimatTipi === 'adres' ? adresler.find(a => a.id === secilenTeslimatAdresi) : null,
      },
      faturaAdresi: adresler.find(a => a.id === secilenFaturaAdresi)
    };
    localStorage.setItem('sepetVerisi', JSON.stringify(sepetVerisi));
    router.push('/sepet/odeme');
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      setIsUpdating(true);
      await updateQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Miktar güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      setIsUpdating(true);
      await removeFromCart(id);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ürün sepetten kaldırılırken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-6">Sepetinizde henüz ürün bulunmuyor.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-6 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <Image
                        src={item.product.urun_resmi_0}
                        alt={item.product.model}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.product.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.product.genislik_mm}/{item.product.profil}R{item.product.cap_inch}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.shop.name} - {item.shop.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Birim: {item.price.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          })}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span>{shipping.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Toplam</span>
                    <span>{total.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    })}</span>
                  </div>
                </div>

                <button
                  onClick={handleSiparisOnayla}
                  disabled={isUpdating}
                  className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 