'use client'

import { useState } from 'react'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 bg-dark-300 rounded"></div>
                <div className="h-64 bg-dark-300 rounded"></div>
              </div>
              <div className="h-64 bg-dark-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-400 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-400 mb-8">Sepetinizde henüz ürün bulunmuyor.</p>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400 pt-16">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Teslimat Seçeneği ve Ürün Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {/* Teslimat Seçenekleri */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaStore className="text-primary" />
                Teslimat Seçeneği
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg cursor-pointer border transition-colors flex items-center gap-3 ${
                    teslimatTipi === 'magaza'
                      ? 'border-primary bg-dark-200'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setTeslimatTipi('magaza')}
                >
                  <FaStore className="text-primary text-xl" />
                  <div>
                    <p className="font-medium text-white">Mağazada Montaj</p>
                    <p className="text-sm text-gray-400">En yakın mağazamızda ücretsiz montaj</p>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg cursor-pointer border transition-colors flex items-center gap-3 ${
                    teslimatTipi === 'adres'
                      ? 'border-primary bg-dark-200'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setTeslimatTipi('adres')}
                >
                  <FaTruck className="text-primary text-xl" />
                  <div>
                    <p className="font-medium text-white">Adrese Teslimat</p>
                    <p className="text-sm text-gray-400">Kapınıza kadar teslimat</p>
                  </div>
                </div>
              </div>

              {/* Mağaza Seçimi veya Teslimat Adresi */}
              <div className="mt-4">
                {teslimatTipi === 'magaza' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* İl ve İlçe Seçimi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">İl Seçin</label>
                        <select
                          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                          value={secilenIl || ''}
                          onChange={(e) => {
                            setSecilenIl(e.target.value ? Number(e.target.value) : null)
                            setSecilenIlce(null)
                            setSecilenMagaza(null)
                          }}
                        >
                          <option value="">İl seçiniz</option>
                          {iller.map((il) => (
                            <option key={il.id} value={il.id}>{il.isim}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">İlçe Seçin</label>
                        <select
                          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                          value={secilenIlce || ''}
                          onChange={(e) => {
                            setSecilenIlce(e.target.value ? Number(e.target.value) : null)
                            setSecilenMagaza(null)
                          }}
                          disabled={!secilenIl}
                        >
                          <option value="">İlçe seçiniz</option>
                          {secilenIl && ilceler
                            .filter(ilce => ilce.il_id === secilenIl)
                            .map((ilce) => (
                              <option key={ilce.id} value={ilce.id}>{ilce.isim}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {secilenIl && secilenIlce && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Mağaza Seçin</label>
                        {magazalar[`${secilenIl}-${secilenIlce}`]?.map((magaza: Magaza) => (
                          <div
                            key={magaza.id}
                            className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                              secilenMagaza === magaza.id
                                ? 'border-primary bg-dark-200'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setSecilenMagaza(magaza.id)}
                          >
                            <p className="font-medium text-white">{magaza.isim}</p>
                            <p className="text-sm text-gray-400">{magaza.adres}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Teslimat Adresi Seçin</label>
                    {adresler.map((adres) => (
                      <div
                        key={adres.id}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                          secilenTeslimatAdresi === adres.id
                            ? 'border-primary bg-dark-200'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => handleTeslimatAdresiChange(adres.id)}
                      >
                        <p className="font-medium text-white">{adres.baslik}</p>
                        <p className="text-sm text-gray-400">{adres.adres}</p>
                        <p className="text-sm text-gray-400">{adres.sehir}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaBox className="text-primary" />
                Ürünler
              </h2>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={item.product.urun_resmi_0}
                      alt={item.product.model}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.product.model}</h3>
                    <p className="text-gray-400">{item.product.genislik_mm}/{item.product.profil}R{item.product.cap_inch}</p>
                    <p className="text-sm text-gray-400">{item.shop.name} - {item.shop.city}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</p>
                    <p className="text-sm text-gray-400">{item.price.toLocaleString('tr-TR')} ₺ (Birim)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Sipariş Özeti */}
          <div className="space-y-4">
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaCreditCard className="text-primary" />
                Sipariş Özeti
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : `${shipping.toLocaleString('tr-TR')} ₺`}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between text-white font-semibold">
                    <span>Genel Toplam</span>
                    <span>{total.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSiparisOnayla}
                className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <FaCreditCard />
                <span>Siparişi Onayla</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 