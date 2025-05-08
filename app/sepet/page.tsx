'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaTrash, FaMinus, FaPlus, FaTruck, FaMapMarkerAlt, FaCreditCard, FaStore, FaBox, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import AdresForm from '../components/AdresForm'
import { useCart } from '../contexts/CartContext'
import { getSupabaseClient } from '@/lib/supabase'

interface Il {
  id: number
  isim: string
}

interface Ilce {
  id: number
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
  const supabase = getSupabaseClient();
  const { sepetUrunler, adetGuncelle: sepetAdetGuncelle, sepettenCikar, toplamTutar } = useCart();
  
  // All useState hooks
  const [isLoading, setIsLoading] = useState(true);
  const [iller] = useState<Il[]>([
    { id: 1, isim: "İstanbul" },
    { id: 2, isim: "Ankara" },
    { id: 3, isim: "İzmir" }
  ]);
  const [ilceler] = useState<Ilceler>({
    1: [
      { id: 1, isim: "Kadıköy" },
      { id: 2, isim: "Beşiktaş" },
      { id: 3, isim: "Üsküdar" },
      { id: 4, isim: "Ataşehir" },
      { id: 5, isim: "Maltepe" }
    ],
    2: [
      { id: 1, isim: "Çankaya" },
      { id: 2, isim: "Keçiören" },
      { id: 3, isim: "Mamak" },
      { id: 4, isim: "Yenimahalle" },
      { id: 5, isim: "Etimesgut" }
    ],
    3: [
      { id: 1, isim: "Konak" },
      { id: 2, isim: "Karşıyaka" },
      { id: 3, isim: "Bornova" },
      { id: 4, isim: "Buca" },
      { id: 5, isim: "Çiğli" }
    ]
  });
  const [magazalar] = useState<Magazalar>({
    "1-1": [ // İstanbul-Kadıköy
      { id: 1, isim: "Lastik Bende Kadıköy", adres: "Caferağa Mah. Moda Cad. No:123" },
      { id: 2, isim: "Lastik Bende Moda", adres: "Moda Mah. Şair Nefi Sok. No:45" }
    ],
    "1-2": [ // İstanbul-Beşiktaş
      { id: 3, isim: "Lastik Bende Beşiktaş", adres: "Sinanpaşa Mah. Barbaros Bulvarı No:78" },
      { id: 4, isim: "Lastik Bende Levent", adres: "Levent Mah. Büyükdere Cad. No:156" }
    ],
    "1-3": [ // İstanbul-Üsküdar
      { id: 5, isim: "Lastik Bende Üsküdar", adres: "Mimar Sinan Mah. Çavuşdere Cad. No:234" },
      { id: 6, isim: "Lastik Bende Altunizade", adres: "Altunizade Mah. Kısıklı Cad. No:89" }
    ],
    "1-4": [ // İstanbul-Ataşehir
      { id: 7, isim: "Lastik Bende Ataşehir", adres: "Atatürk Mah. Meriç Cad. No:67" },
      { id: 8, isim: "Lastik Bende Batı Ataşehir", adres: "Barbaros Mah. Dereboyu Cad. No:12" }
    ],
    "2-1": [ // Ankara-Çankaya
      { id: 9, isim: "Lastik Bende Çankaya", adres: "Kızılay Mah. Atatürk Bulvarı No:145" },
      { id: 10, isim: "Lastik Bende Tunalı", adres: "Tunalı Hilmi Cad. No:98" }
    ],
    "3-1": [ // İzmir-Konak
      { id: 11, isim: "Lastik Bende Alsancak", adres: "Alsancak Mah. Kıbrıs Şehitleri Cad. No:167" },
      { id: 12, isim: "Lastik Bende Konak", adres: "Konak Mah. Gazi Bulvarı No:34" }
    ]
  });
  const [adresler, setAdresler] = useState<any[]>([]);
  const [secilenTeslimatAdresi, setSecilenTeslimatAdresi] = useState<number | null>(null);
  const [secilenFaturaAdresi, setSecilenFaturaAdresi] = useState<number | null>(null);
  const [faturaAdresiAyni, setFaturaAdresiAyni] = useState(false);
  const [teslimatTipi, setTeslimatTipi] = useState('magaza');
  const [secilenIl, setSecilenIl] = useState<number | null>(null);
  const [secilenIlce, setSecilenIlce] = useState<number | null>(null);
  const [secilenMagaza, setSecilenMagaza] = useState<number | null>(null);
  const [montajTarihi, setMontajTarihi] = useState<string>('');
  const [montajSaati, setMontajSaati] = useState<string>('');
  const [montajNotu, setMontajNotu] = useState<string>('');
  const [kargoUcreti, setKargoUcreti] = useState<number>(0);
  const [adresFormOpen, setAdresFormOpen] = useState<null | 'teslimat' | 'fatura'>(null);
  const [editAdres, setEditAdres] = useState<any | null>(null);

  // All useEffect hooks
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/kullanici/giris');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/kullanici/giris');
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  // Adresleri yenileme fonksiyonu
  const refreshAddresses = async () => {
    try {
      const res = await fetch('/api/user/address', {
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        setAdresler(json.data);
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    }
  };

  // Adres formu başarılı olduğunda
  const handleAdresFormSuccess = async (data: any) => {
    await refreshAddresses();
    setEditAdres(null);
    setAdresFormOpen(null);
  };

  // Initial fetch
  useEffect(() => {
    refreshAddresses();
  }, []);

  // Shipping fee calculation effect
  useEffect(() => {
    if (teslimatTipi === 'adres' && secilenTeslimatAdresi) {
      const secilenAdres = adresler.find(a => a.id === secilenTeslimatAdresi);
      if (!secilenAdres) {
        setKargoUcreti(0);
        return;
      }
      
      const kargoUcretleri: { [key: string]: number } = {
        'İstanbul': 50,
        'Ankara': 60,
        'İzmir': 70,
        'default': 80
      };
      
      const ucret = kargoUcretleri[secilenAdres.sehir] || kargoUcretleri.default;
      setKargoUcreti(ucret);
    } else {
      setKargoUcreti(0);
    }
  }, [teslimatTipi, secilenTeslimatAdresi, adresler]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Event handlers and other functions
  const handleFaturaAdresiChange = (adresId: number) => {
    setSecilenFaturaAdresi(adresId);
    if (faturaAdresiAyni) {
      setSecilenTeslimatAdresi(adresId);
    }
  };

  const handleTeslimatAdresiChange = (adresId: number) => {
    setSecilenTeslimatAdresi(adresId);
    if (faturaAdresiAyni) {
      setSecilenFaturaAdresi(adresId);
    }
  };

  const handleFaturaAdresiAyniChange = (checked: boolean) => {
    setFaturaAdresiAyni(checked);
    if (checked && secilenTeslimatAdresi) {
      setSecilenFaturaAdresi(secilenTeslimatAdresi);
    }
  };

  const adetGuncelle = (urunId: number, yeniAdet: number) => {
    const urun = sepetUrunler.find(u => u.id === urunId);
    if (urun) {
      sepetAdetGuncelle(urunId, urun.ebat, Math.max(1, yeniAdet));
    }
  };

  const urunSil = (urunId: number) => {
    const urun = sepetUrunler.find(u => u.id === urunId);
    if (urun) {
      sepettenCikar(urunId, urun.ebat);
    }
  };

  const handleAdresSil = async (id: number) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/user/address', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      if (secilenTeslimatAdresi === id) setSecilenTeslimatAdresi(null);
      if (secilenFaturaAdresi === id) setSecilenFaturaAdresi(null);
      const res = await fetch('/api/user/address', {
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) setAdresler(json.data);
    } catch (err) {
      alert('Adres silinirken bir hata oluştu.');
    }
  };

  const handleSiparisOnayla = () => {
    // Teslimat tipine göre validasyon
    if (teslimatTipi === 'magaza') {
      if (!secilenMagaza || !secilenFaturaAdresi || !montajTarihi || !montajSaati) {
        alert('Lütfen mağaza, fatura adresi ve montaj randevusu bilgilerini giriniz.');
        return;
      }
    } else if (!secilenTeslimatAdresi || !secilenFaturaAdresi) {
      alert('Lütfen teslimat ve fatura adresi seçiniz.');
      return;
    }

    // Sepet verilerini localStorage'a kaydet
    const sepetVerisi = {
      urunler: sepetUrunler,
      toplamTutar,
      kargoUcreti,
      genelToplam,
      teslimatBilgileri: {
        tip: teslimatTipi,
        magaza: teslimatTipi === 'magaza' ? {
          ...magazalar[`${secilenIl}-${secilenIlce}`]?.find(m => m.id === secilenMagaza),
          montajTarihi,
          montajSaati,
          montajNotu
        } : null,
        teslimatAdresi: teslimatTipi === 'adres' ? adresler.find(a => a.id === secilenTeslimatAdresi) : null,
      },
      faturaAdresi: adresler.find(a => a.id === secilenFaturaAdresi),
      durum: {
        kod: 'siparis_alindi',
        mesaj: 'Sipariş Alındı',
        tarih: new Date().toISOString(),
        sonrakiDurum: teslimatTipi === 'magaza' ? 'onaylandi' : 'onaylandi',
        durumGecmisi: [
          {
            kod: 'siparis_alindi',
            mesaj: 'Sipariş Alındı',
            tarih: new Date().toISOString()
          }
        ],
        durumAkisi: teslimatTipi === 'magaza' 
          ? ['siparis_alindi', 'onaylandi', 'montaj', 'tamamlandi']
          : ['siparis_alindi', 'onaylandi', 'kargoya_verildi', 'tamamlandi']
      }
    };
    localStorage.setItem('sepetVerisi', JSON.stringify(sepetVerisi));
    router.push('/sepet/odeme');
  };

  // Calculate totals
  const kargo = kargoUcreti;
  const genelToplam = toplamTutar + kargo;

  return (
    <div className="min-h-screen bg-dark-400 pt-16">
      {/* AdresForm Modal (Ekle/Güncelle) */}
      {(adresFormOpen || editAdres) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-400 rounded-lg shadow-lg p-4 w-full max-w-md">
            <AdresForm
              onSubmit={handleAdresFormSuccess}
              onCancel={() => { setAdresFormOpen(null); setEditAdres(null); }}
              initialValues={editAdres ? {
                id: editAdres.id,
                adres_baslik: editAdres.baslik,
                adres: editAdres.adres,
                sehir: editAdres.sehir,
                ilce: editAdres.ilce,
                telefon: editAdres.telefon,
                adres_tipi: editAdres.adres_tipi || (adresFormOpen || 'teslimat'),
              } : { adres_tipi: adresFormOpen || 'teslimat' }}
              isEdit={!!editAdres}
            />
          </div>
        </div>
      )}
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
                          {secilenIl && ilceler[secilenIl]?.map((ilce: Ilce) => (
                            <option key={ilce.id} value={ilce.id}>{ilce.isim}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mağaza Listesi */}
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
                    {/* Teslimat Adresi Seçimi */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Teslimat Adresi Seçin</label>
                      {adresler.map((adres) => (
                        <div
                          key={adres.id}
                          className={`p-3 rounded-lg cursor-pointer border transition-colors flex justify-between items-center ${
                            secilenTeslimatAdresi === adres.id
                              ? 'border-primary bg-dark-200'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          onClick={() => handleTeslimatAdresiChange(adres.id)}
                        >
                          <div>
                            <p className="font-medium text-white">{adres.baslik}</p>
                            <p className="text-sm text-gray-400">{adres.adres}</p>
                            <p className="text-sm text-gray-400">{adres.sehir}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              type="button"
                              className="text-primary hover:text-yellow-400"
                              onClick={e => { e.stopPropagation(); setEditAdres(adres); }}
                              title="Düzenle"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-600"
                              onClick={e => { e.stopPropagation(); handleAdresSil(adres.id); }}
                              title="Sil"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="w-full py-2 text-center text-primary hover:text-red-400 transition-colors"
                        onClick={() => setAdresFormOpen('teslimat')}
                      >
                        + Yeni Teslimat Adresi Ekle
                      </button>
                    </div>

                    {/* Fatura Adresi Aynı Checkbox */}
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="faturaAdresiAyni"
                        checked={faturaAdresiAyni}
                        onChange={(e) => handleFaturaAdresiAyniChange(e.target.checked)}
                        className="w-4 h-4 text-primary bg-dark-400 border-gray-700 rounded focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor="faturaAdresiAyni" className="text-white">
                        Fatura adresim teslimat adresim ile aynı olsun
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* After the store selection section */}
            {secilenMagaza && (
              <div className="space-y-4 mt-4 p-4 bg-dark-200 rounded-lg">
                <h3 className="text-lg font-semibold text-white">Montaj Randevusu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tarih</label>
                    <input
                      type="date"
                      value={montajTarihi}
                      onChange={(e) => setMontajTarihi(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Saat</label>
                    <select
                      value={montajSaati}
                      onChange={(e) => setMontajSaati(e.target.value)}
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                      required
                    >
                      <option value="">Saat seçiniz</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Montaj Notu (Opsiyonel)</label>
                  <textarea
                    value={montajNotu}
                    onChange={(e) => setMontajNotu(e.target.value)}
                    className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    rows={2}
                    placeholder="Montaj için özel notunuz varsa belirtebilirsiniz"
                  />
                </div>
              </div>
            )}

            {/* Ürün Listesi */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaBox className="text-primary" />
                Ürünler
              </h2>
              {sepetUrunler.length > 0 ? (
                sepetUrunler.map((urun) => (
                  <div key={urun.id} className="flex items-center gap-4">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-800">
                      <Image
                        src={urun.resim}
                        alt={urun.isim}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{urun.isim}</h3>
                      <p className="text-gray-400">{urun.ebat}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adetGuncelle(urun.id, urun.adet - 1)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                          >
                            <FaMinus size={14} />
                          </button>
                          <span className="w-8 text-center text-white">{urun.adet}</span>
                          <button
                            onClick={() => adetGuncelle(urun.id, urun.adet + 1)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => urunSil(urun.id)}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{(urun.fiyat * urun.adet).toLocaleString('tr-TR')} ₺</p>
                      <p className="text-sm text-gray-400">{urun.fiyat.toLocaleString('tr-TR')} ₺ (Birim)</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-dark-300 rounded-lg border border-gray-700">
                  <p className="text-gray-400 mb-4">Sepetinizde ürün bulunmamaktadır.</p>
                  <Link 
                    href="/urunler" 
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Taraf - Fatura Adresi ve Sipariş Özeti */}
          <div className="space-y-4">
            {/* Fatura Adresi Seçimi */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                Fatura Adresi
              </h2>
              <div className="space-y-3">
                {adresler.map((adres) => (
                  <div
                    key={adres.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors flex justify-between items-center ${
                      secilenFaturaAdresi === adres.id
                        ? 'border-primary bg-dark-200'
                        : 'border-gray-700 hover:border-gray-600'
                    } ${faturaAdresiAyni && teslimatTipi === 'adres' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !faturaAdresiAyni && handleFaturaAdresiChange(adres.id)}
                  >
                    <div>
                      <p className="font-medium text-white">{adres.baslik}</p>
                      <p className="text-sm text-gray-400 mt-1">{adres.isim}</p>
                      <p className="text-sm text-gray-400">{adres.adres}</p>
                      <p className="text-sm text-gray-400">{adres.sehir}</p>
                      <p className="text-sm text-gray-400">{adres.telefon}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        className="text-primary hover:text-yellow-400"
                        onClick={e => { e.stopPropagation(); setEditAdres(adres); }}
                        title="Düzenle"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600"
                        onClick={e => { e.stopPropagation(); handleAdresSil(adres.id); }}
                        title="Sil"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="w-full py-2 text-center text-primary hover:text-red-400 transition-colors"
                  onClick={() => setAdresFormOpen('fatura')}
                >
                  + Yeni Adres Ekle
                </button>
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaCreditCard className="text-primary" />
                Sipariş Özeti
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Ara Toplam</span>
                  <span>{toplamTutar.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Kargo</span>
                  <span className="text-green-500">Ücretsiz</span>
                </div>
                <div className="border-t border-gray-700 my-2 pt-2">
                  <div className="flex justify-between text-white font-semibold">
                    <span>Toplam</span>
                    <span>{genelToplam.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSiparisOnayla}
                disabled={
                  (teslimatTipi === 'magaza' && (!secilenMagaza || !secilenFaturaAdresi)) ||
                  (teslimatTipi === 'adres' && (!secilenTeslimatAdresi || !secilenFaturaAdresi))
                }
                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCreditCard className="w-5 h-5" />
                Ödeme Adımına Geç
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 