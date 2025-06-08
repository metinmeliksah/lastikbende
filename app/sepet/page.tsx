'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaTrash, FaMinus, FaPlus, FaTruck, FaMapMarkerAlt, FaCreditCard, FaStore, FaBox, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import AdresForm from '../components/AdresForm'
import { useCart } from '../contexts/CartContext'
import { getSupabaseClient } from '@/lib/supabase'
import { useAdres } from '../contexts/AdresContext'
import { useSiparis } from '../contexts/SiparisContext'
import { Adres, MontajBilgisi } from '../types'
import { toast } from 'react-hot-toast'
import MontajForm from '../components/MontajForm'
import { Check } from 'lucide-react'

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

interface Seller {
  id: number;
  isim: string;
  sehir: string;
  ilce: string;
  adres: string;
  telefon: string;
  durum: boolean;
}

interface SupabaseResponse {
  id: number;
  isim: string;
  sehir: string;
  ilce: string;
  adres: string;
  telefon: string;
  durum: boolean;
  created_at: string;
  updated_at: string;
  vergi_no: string;
  vergi_dairesi: string;
}

export default function SepetPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { sepetUrunler, adetGuncelle: sepetAdetGuncelle, sepettenCikar, toplamTutar, yukleniyor } = useCart();
  const { adresler, yukleniyor: adreslerYukleniyor, adresleriYenile, adresSil } = useAdres();
  const { siparisOlustur, siparisDetayEkle } = useSiparis();
  
  // State tanımlamaları
  const [isLoading, setIsLoading] = useState(true);
  const [secilenTeslimatAdresi, setSecilenTeslimatAdresi] = useState<Adres | null>(null);
  const [secilenFaturaAdresi, setSecilenFaturaAdresi] = useState<Adres | null>(null);
  const [faturaAdresiAyni, setFaturaAdresiAyni] = useState(false);
  const [teslimatTipi, setTeslimatTipi] = useState<'adres' | 'magaza'>('adres');
  const [secilenMagaza, setSecilenMagaza] = useState<number | null>(null);
  const [montajTarihi, setMontajTarihi] = useState<string>('');
  const [montajSaati, setMontajSaati] = useState<string>('');
  const [montajNotu, setMontajNotu] = useState<string>('');
  const [kargoUcreti, setKargoUcreti] = useState<number>(0);
  const [adresFormOpen, setAdresFormOpen] = useState<'fatura' | 'teslimat' | null>(null);
  const [editAdres, setEditAdres] = useState<Adres | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [odemeSayfasinaGit, setOdemeSayfasinaGit] = useState(false);
  const [teslimatAdresId, setTeslimatAdresId] = useState<number | null>(null);
  const [faturaAdresId, setFaturaAdresId] = useState<number | null>(null);
  const [yeniAdresEkleniyor, setYeniAdresEkleniyor] = useState(false);
  const [adresYukleniyor, setAdresYukleniyor] = useState(true);
  const [adresError, setAdresError] = useState('');
  const [stokBilgileri, setStokBilgileri] = useState<{[key: number]: number}>({});
  
  // Yeni state'ler
  const [magazaIdleri, setMagazaIdleri] = useState<number[]>([]);
  const [ayniMagazadanMi, setAyniMagazadanMi] = useState<boolean>(false);
  const [secilebilecekMagazaId, setSecilebilecekMagazaId] = useState<number | null>(null);
  const [magzadaMontajAktif, setMagzadaMontajAktif] = useState<boolean>(true);

  // Sellers verilerini yükle
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadSellers();
        await refreshAddresses();
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Şehir ve ilçe seçimine göre bayileri filtrele
  useEffect(() => {
    const filtered = sellers.filter(seller => 
      seller.durum && // Sadece aktif bayileri göster
      (!selectedCity || seller.sehir === selectedCity) &&
      (!selectedDistrict || seller.ilce === selectedDistrict)
    );
    setFilteredSellers(filtered);
  }, [selectedCity, selectedDistrict, sellers]);

  const loadSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('durum', true)
        .order('isim');
      
      if (error) {
        throw error;
      }
      
      const rawData = data as unknown as SupabaseResponse[];
      const typedData = (rawData || []).map(item => ({
        id: item.id,
        isim: item.isim,
        sehir: item.sehir,
        ilce: item.ilce,
        adres: item.adres,
        telefon: item.telefon,
        durum: item.durum
      }));
      setSellers(typedData);
    } catch (error) {
      console.error('Bayiler yüklenirken hata:', error);
      throw error;
    }
  };

  // Benzersiz şehirleri ve ilçeleri al
  const cities = Array.from(new Set(sellers.filter(s => s.durum).map(s => s.sehir))).sort();
  const districts = Array.from(new Set(
    sellers
      .filter(s => s.durum && (!selectedCity || s.sehir === selectedCity))
      .map(s => s.ilce)
  )).sort();

  // Adresleri yenileme fonksiyonu
  const refreshAddresses = async () => {
    try {
      await adresleriYenile();
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
      toast.error('Adresler yüklenirken bir hata oluştu');
      throw error;
    }
  };

  // Adres formu başarılı olduğunda
  const handleAdresFormSuccess = (data: Adres) => {
    if (editAdres) {
      setEditAdres(null);
    } else {
      setAdresFormOpen(null);
    }
    // Optionally use the data if needed
    if (data.adres_tipi === 'teslimat' && data.id) {
      setSecilenTeslimatAdresi(data);
      if (faturaAdresiAyni) {
        setSecilenFaturaAdresi(data);
      }
    } else if (data.adres_tipi === 'fatura' && data.id) {
      setSecilenFaturaAdresi(data);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshAddresses();
  }, []);

  // Shipping fee calculation effect
  useEffect(() => {
    if (teslimatTipi === 'adres' && secilenTeslimatAdresi) {
      const secilenAdres = adresler.find((a: Adres) => a.id === secilenTeslimatAdresi.id);
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

  // Stok bilgilerini yükle
  useEffect(() => {
    const stokBilgileriniYukle = async () => {
      if (sepetUrunler.length === 0) return;
      
      const stokIdleri = sepetUrunler.map(urun => urun.stok_id);
      try {
        const { data, error } = await supabase
          .from('stok')
          .select('stok_id, stok_adet')
          .in('stok_id', stokIdleri);

        if (error) {
          console.error('Stok bilgileri yüklenirken hata:', error);
          return;
        }

        const stokVerileri = (data || []).reduce((acc, item: any) => {
          acc[item.stok_id] = item.stok_adet;
          return acc;
        }, {} as {[key: number]: number});

        setStokBilgileri(stokVerileri);
      } catch (error) {
        console.error('Stok bilgileri yüklenirken hata:', error);
      }
    };

    stokBilgileriniYukle();
  }, [sepetUrunler, supabase]);

  // Adet güncelleme işlemi - stok kontrolü ile
  const handleAdetGuncelle = (stokId: number, yeniAdet: number) => {
    const urun = sepetUrunler.find(u => u.stok_id === stokId);
    if (!urun) return;
    
    const stokLimiti = stokBilgileri[stokId] || 0;
    
    // Stok limitini aşmayacak şekilde güncelle
    const guncellenecekAdet = Math.min(Math.max(1, yeniAdet), stokLimiti);
    
    // CartContext'teki adetGuncelle fonksiyonunu çağır
    sepetAdetGuncelle(stokId, guncellenecekAdet);
    
    if (yeniAdet > stokLimiti) {
      toast.error(`Maksimum stok miktarı ${stokLimiti} adettir`);
    }
  };

  // Sepetteki ürünlerin mağaza ID'lerini kontrol et
  useEffect(() => {
    const magazaIdleriKontrol = async () => {
      if (sepetUrunler.length === 0) {
        setMagazaIdleri([]);
        setAyniMagazadanMi(false);
        setMagzadaMontajAktif(false);
        return;
      }
      
      try {
        // Sepetteki ürünlerin stok ID'lerini al
        const stokIdleri = sepetUrunler.map(urun => urun.stok_id);
        
        // Stok bilgilerini çek
        const { data, error } = await supabase
          .from('stok')
          .select('stok_id, magaza_id')
          .in('stok_id', stokIdleri);
          
        if (error) {
          console.error('Mağaza bilgileri yüklenirken hata:', error);
          setMagzadaMontajAktif(false);
          return;
        }
        
        // Mağaza ID'lerini al
        const magazaIds = (data || []).map((item: any) => item.magaza_id);
        setMagazaIdleri(magazaIds);
        
        // Tüm ürünler aynı mağazadan mı kontrol et
        const tekMagazaId = magazaIds.length > 0 ? magazaIds[0] : null;
        const tekMagazadanMi = magazaIds.every(id => id === tekMagazaId);
        
        setAyniMagazadanMi(tekMagazadanMi);
        
        if (tekMagazadanMi && tekMagazaId) {
          // Mağaza aktif mi kontrol et
          const magazaAktif = sellers.some(seller => seller.id === tekMagazaId && seller.durum);
          setMagzadaMontajAktif(magazaAktif);
          setSecilebilecekMagazaId(magazaAktif ? tekMagazaId : null);
          
          // Mağaza seçeneğini otomatik olarak seç
          if (teslimatTipi === 'magaza' && magazaAktif) {
            setSecilenMagaza(tekMagazaId);
            
            // Şehir ve ilçe bilgilerini de güncelle
            const magaza = sellers.find(s => s.id === tekMagazaId);
            if (magaza) {
              setSelectedCity(magaza.sehir);
              setSelectedDistrict(magaza.ilce);
            }
          }
        } else {
          setMagzadaMontajAktif(false);
          setSecilebilecekMagazaId(null);
          
          // Eğer montaj seçiliyse ve artık mağazada montaj yapılamıyorsa teslimat tipini adrese çevir
          if (teslimatTipi === 'magaza') {
            setTeslimatTipi('adres');
            toast.error('Sepetinizdeki ürünler farklı mağazalardan geldiği için mağazada montaj seçeneği pasif hale getirildi.');
          }
        }
      } catch (error) {
        console.error('Mağaza kontrolü yapılırken hata:', error);
        setMagzadaMontajAktif(false);
      }
    };
    
    magazaIdleriKontrol();
  }, [sepetUrunler, sellers]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Event handlers and other functions
  const handleTeslimatAdresiChange = (id: number) => {
    setSecilenTeslimatAdresi(adresler.find((a: Adres) => a.id === id) || null);
    if (faturaAdresiAyni) {
      setSecilenFaturaAdresi(adresler.find((a: Adres) => a.id === id) || null);
    }
  };

  const handleFaturaAdresiChange = (id: number) => {
    setSecilenFaturaAdresi(adresler.find((a: Adres) => a.id === id) || null);
  };

  const handleFaturaAdresiAyniChange = (checked: boolean) => {
    setFaturaAdresiAyni(checked);
    if (checked && secilenTeslimatAdresi) {
      setSecilenFaturaAdresi(secilenTeslimatAdresi);
    }
  };

  const urunSil = (stokId: number) => {
    const urun = sepetUrunler.find(u => u.stok_id === stokId);
    if (urun) {
      sepettenCikar(stokId);
    }
  };

  const handleAdresSil = async (id: number) => {
    try {
      // Önce bu adresin siparişlerde kullanılıp kullanılmadığını kontrol et
      const { data: siparisKontrol, error: kontrolError } = await supabase
        .from('siparis')
        .select('id')
        .or(`teslimat_adres_id.eq.${id},fatura_adres_id.eq.${id}`)
        .limit(1);

      if (kontrolError) throw kontrolError;

      if (siparisKontrol && siparisKontrol.length > 0) {
        toast.error('Bu adres daha önce verilen siparişlerde kullanıldığı için silinemiyor.');
        return;
      }

      // Context içindeki adresSil fonksiyonunu kullan
      await adresSil(id);

      // Seçili adresleri güncelle
      if (secilenTeslimatAdresi?.id === id) setSecilenTeslimatAdresi(null);
      if (secilenFaturaAdresi?.id === id) setSecilenFaturaAdresi(null);
      
      toast.success('Adres başarıyla silindi');
    } catch (err) {
      console.error('Adres silme hatası:', err);
      toast.error('Adres silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleSiparisOnayla = async () => {
    try {
      // Teslimat adresi kontrolü
      if (teslimatTipi === 'adres' && !secilenTeslimatAdresi) {
        toast.error('Lütfen teslimat adresi seçiniz');
        return;
      }

      // Fatura adresi kontrolü
      if (!secilenFaturaAdresi) {
        toast.error('Lütfen fatura adresi seçiniz');
        return;
      }

      // ID'lerin doğru şekilde alındığından emin ol
      const teslimatAdresiId = teslimatTipi === 'adres' ? secilenTeslimatAdresi?.id : null;
      const faturaAdresiId = secilenFaturaAdresi?.id;
      
      if (teslimatTipi === 'adres' && !teslimatAdresiId) {
        toast.error('Teslimat adresi bilgisi eksik');
      return;
    }

      if (!faturaAdresiId) {
        toast.error('Fatura adresi bilgisi eksik');
        return;
      }

      // Mağaza teslimatı kontrolü
      if (teslimatTipi === 'magaza') {
        // Önce sepetteki ürünlerin aynı mağazadan gelip gelmediğini kontrol et
        if (!ayniMagazadanMi) {
          toast.error('Mağazada montaj seçeneği için sepetinizdeki tüm ürünlerin aynı mağazadan olması gerekir');
      return;
    }

        // Mağaza aktif mi kontrol et
        if (!magzadaMontajAktif) {
          toast.error('Seçilen mağaza şu anda aktif değil');
          return;
        }

        if (!secilenMagaza) {
          toast.error('Lütfen montaj yapılacak bayi seçiniz');
          return;
        }

        if (!montajTarihi || !montajSaati) {
          toast.error('Lütfen montaj tarih ve saatini seçiniz');
          return;
        }

        const secilenTarih = new Date(montajTarihi);
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);

        if (secilenTarih < bugun) {
          toast.error('Geçmiş bir tarih seçemezsiniz');
          return;
        }
      }

      // Konsola log ekle (debugging)
      console.log('Sipariş öncesi adres bilgileri:');
      console.log('- Teslimat tipi:', teslimatTipi);
      console.log('- Teslimat adresi ID:', teslimatAdresiId);
      console.log('- Fatura adresi ID:', faturaAdresiId);
      console.log('- Mağaza ID:', secilenMagaza);

      // Sepet verisini hazırla
    const sepetVerisi = {
      urunler: sepetUrunler,
      toplamTutar,
        kargo: kargoUcreti,
      genelToplam,
      teslimatBilgileri: {
        tip: teslimatTipi,
          magaza: teslimatTipi === 'magaza' ? {
            id: secilenMagaza,
            isim: sellers.find(s => s.id === secilenMagaza)?.isim || '',
            adres: sellers.find(s => s.id === secilenMagaza)?.adres || ''
          } : null,
          teslimatAdresi: teslimatTipi === 'adres' ? {
            id: teslimatAdresiId,
            baslik: secilenTeslimatAdresi?.adres_baslik || '',
            adres: secilenTeslimatAdresi?.adres || '',
            sehir: secilenTeslimatAdresi?.sehir || '',
            telefon: secilenTeslimatAdresi?.telefon || ''
          } : null,
          montajBilgisi: teslimatTipi === 'magaza' ? {
            tarih: montajTarihi,
            saat: montajSaati,
            not: montajNotu
          } : null
        },
        faturaAdresi: {
          id: faturaAdresiId,
          baslik: secilenFaturaAdresi.adres_baslik,
          adres: secilenFaturaAdresi.adres,
          sehir: secilenFaturaAdresi.sehir,
          telefon: secilenFaturaAdresi.telefon
        }
      };

      console.log('Ödeme sayfasına gönderilecek sepet verisi:', JSON.stringify(sepetVerisi, null, 2));

      // Sepet verisini localStorage'a kaydet
    localStorage.setItem('sepetVerisi', JSON.stringify(sepetVerisi));

      // Ödeme sayfasına yönlendir
    router.push('/sepet/odeme');
      
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  // Calculate totals
  const kargo = kargoUcreti;
  const genelToplam = toplamTutar + kargo;

  // Adres kartı bileşeni
  const AdresKarti = ({ adres, isSelected, onClick, onEdit, onDelete, disabled = false }: {
    adres: Adres;
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    disabled?: boolean;
  }) => (
    <div
      className={`relative group p-4 rounded-lg cursor-pointer border transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-dark-200 shadow-lg'
          : 'border-gray-700 hover:border-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-white">{adres.adres_baslik}</p>
          <p className="text-sm text-gray-400 mt-1">{adres.adres}</p>
          <p className="text-sm text-gray-400">{adres.sehir}, {adres.ilce}</p>
          <p className="text-sm text-gray-400">{adres.telefon}</p>
        </div>
        
        {/* Düzenle/Sil butonları */}
        <div className={`flex gap-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-primary hover:text-yellow-400 transition-colors rounded-full hover:bg-dark-300"
            title="Düzenle"
          >
            <FaEdit size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-full hover:bg-dark-300"
            title="Sil"
          >
            <FaTrashAlt size={16} />
          </button>
        </div>
      </div>

      {/* Seçili durumu göstergesi */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
          <Check size={14} />
        </div>
      )}
    </div>
  );

  // Adres listesi bileşeni
  const AdresListesi = ({ tip, adresler, secilenAdres, onAdresSecim, disabled = false }: {
    tip: 'teslimat' | 'fatura';
    adresler: Adres[];
    secilenAdres: Adres | null;
    onAdresSecim: (adres: Adres) => void;
    disabled?: boolean;
  }) => {
    const filtreliAdresler = adresler.filter(adres => 
      tip === 'fatura' ? true : adres.adres_tipi === 'teslimat'
    );

    return (
      <div className="space-y-3">
        {filtreliAdresler.map((adres) => (
          <AdresKarti
            key={adres.id}
            adres={adres}
            isSelected={secilenAdres?.id === adres.id}
            onClick={() => onAdresSecim(adres)}
            onEdit={() => setEditAdres(adres)}
            onDelete={() => {
              // Silme onayı için toast kullan
              toast((t) => (
                <div className="flex flex-col gap-4">
                  <p className="text-sm">Bu adresi silmek istediğinize emin misiniz?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      İptal
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => {
                        adres.id && handleAdresSil(adres.id);
                        toast.dismiss(t.id);
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ), {
                duration: 5000,
                position: 'top-center',
              });
            }}
            disabled={disabled}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-400 pt-16">
      {/* AdresForm Modal (Ekle/Güncelle) */}
      {(adresFormOpen || editAdres) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-400 rounded-lg shadow-lg p-4 w-full max-w-md">
            <AdresForm
              tip={editAdres?.adres_tipi || adresFormOpen || 'teslimat'}
              initialValues={editAdres || undefined}
              onSuccess={handleAdresFormSuccess}
              onCancel={() => { setAdresFormOpen(null); setEditAdres(null); }}
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
                  } ${!magzadaMontajAktif ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (magzadaMontajAktif) {
                      setTeslimatTipi('magaza');
                      // Otomatik olarak mağazayı seç
                      if (secilebilecekMagazaId) {
                        setSecilenMagaza(secilebilecekMagazaId);
                      }
                    } else {
                      toast.error('Sepetinizdeki ürünler farklı mağazalardan geldiği veya mağaza aktif olmadığı için mağazada montaj seçeneği kullanılamaz.');
                    }
                  }}
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
                    {/* Mağaza Seçimi - Tüm ürünler aynı mağazadan ise otomatik olarak seç */}
                    {ayniMagazadanMi && secilebilecekMagazaId ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Mağaza</label>
                        {sellers
                          .filter(seller => seller.id === secilebilecekMagazaId)
                          .map(seller => (
                            <div
                              key={seller.id}
                              className="p-3 rounded-lg border border-primary bg-dark-200 mb-2"
                            >
                              <p className="font-medium text-white">{seller.isim}</p>
                              <p className="text-sm text-gray-400">{seller.adres}</p>
                              <p className="text-sm text-gray-400">Tel: {seller.telefon}</p>
                      </div>
                          ))}
                        <p className="text-sm text-primary mt-2">
                          Mağazada montaj seçeneği, sepetinizdeki tüm ürünlerin aynı mağazadan olması durumunda kullanılabilir.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400">Mağazada montaj seçeneği şu anda kullanılamıyor.</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {!ayniMagazadanMi 
                            ? 'Sepetinizdeki ürünler farklı mağazalardan geliyor.' 
                            : 'Seçilen mağaza aktif değil.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Teslimat Adresi Seçimi */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Teslimat Adresi Seçin</label>
                      <AdresListesi
                        tip="teslimat"
                        adresler={adresler}
                        secilenAdres={secilenTeslimatAdresi}
                        onAdresSecim={(adres) => adres.id && handleTeslimatAdresiChange(adres.id)}
                      />
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
            {teslimatTipi === 'magaza' && secilenMagaza && (
              <div className="space-y-4 mt-4 p-4 bg-dark-200 rounded-lg">
                <h3 className="text-lg font-semibold text-white">Montaj Randevusu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Montaj Tarihi</label>
                    <input
                      type="date"
                      value={montajTarihi}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setMontajTarihi(e.target.value)}
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Montaj Saati</label>
                    <select
                      value={montajSaati}
                      onChange={(e) => setMontajSaati(e.target.value)}
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    >
                      <option value="">Saat Seçiniz</option>
                      {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(saat => (
                        <option key={saat} value={saat}>{saat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Montaj Notu (Opsiyonel)</label>
                  <textarea
                    value={montajNotu}
                    onChange={(e) => setMontajNotu(e.target.value)}
                    className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    rows={3}
                    placeholder="Montaj için eklemek istediğiniz notları buraya yazabilirsiniz..."
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
                sepetUrunler.map((urun) => {
                  const stokLimiti = stokBilgileri[urun.stok_id] || 0;
                  const adetStokLimitinde = urun.adet >= stokLimiti;

                  return (
                    <div key={urun.id} className="flex flex-col md:flex-row items-center border-b border-gray-700 py-6 last:border-b-0">
                      {/* Ürün Görseli */}
                      <div className="w-full md:w-1/5 flex justify-center mb-4 md:mb-0">
                        <div className="relative h-28 w-28 overflow-hidden rounded-md">
                      <Image
                            src={urun.resim || '/placeholder-tire.jpg'} 
                        alt={urun.isim}
                            width={112} 
                            height={112}
                        className="object-cover"
                      />
                    </div>
                      </div>
                      
                      {/* Ürün Bilgileri */}
                      <div className="w-full md:w-2/5 text-center md:text-left mb-4 md:mb-0 space-y-1">
                        <h3 className="text-lg font-medium text-white">{urun.isim}</h3>
                        <p className="text-sm text-gray-400">Ebat: {urun.ebat}</p>
                        {stokLimiti > 0 && (
                          <p className="text-xs text-primary">
                            Stokta {stokLimiti} adet
                          </p>
                        )}
                      </div>
                      
                      {/* Miktar */}
                      <div className="w-full md:w-1/5 flex items-center justify-center mb-4 md:mb-0">
                          <button
                            onClick={() => handleAdetGuncelle(urun.stok_id, urun.adet - 1)}
                          className="bg-dark-400 text-white px-3 py-1 rounded-l-md hover:bg-dark-200 transition-colors"
                          disabled={yukleniyor || urun.adet <= 1}
                          >
                          <FaMinus className="text-xs" />
                          </button>
                        <span className="w-12 text-center bg-dark-400 text-white py-1 border-x border-gray-700">{urun.adet}</span>
                          <button
                            onClick={() => handleAdetGuncelle(urun.stok_id, urun.adet + 1)}
                          className={`bg-dark-400 text-white px-3 py-1 rounded-r-md transition-colors ${
                            adetStokLimitinde ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-200'
                          }`}
                          disabled={yukleniyor || adetStokLimitinde}
                          >
                          <FaPlus className="text-xs" />
                          </button>
                        </div>
                      
                      {/* Fiyat */}
                      <div className="w-full md:w-1/5 text-center md:text-right mb-4 md:mb-0">
                        <p className="text-lg font-medium text-white">{(urun.fiyat * urun.adet).toFixed(2)} ₺</p>
                        <p className="text-sm text-gray-400">Birim: {urun.fiyat.toFixed(2)} ₺</p>
                      </div>
                      
                      {/* Kaldır */}
                      <div className="w-full md:w-10 flex justify-center">
                        <button
                          onClick={() => sepettenCikar(urun.stok_id)}
                          className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-dark-400"
                          disabled={yukleniyor}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-dark-200 rounded-lg border border-gray-700">
                  <p className="text-gray-400 mb-4">Sepetinizde ürün bulunmamaktadır.</p>
                  <Link 
                    href="/urunler" 
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
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
                <AdresListesi
                  tip="fatura"
                  adresler={adresler}
                  secilenAdres={secilenFaturaAdresi}
                  onAdresSecim={(adres) => adres.id && handleFaturaAdresiChange(adres.id)}
                  disabled={faturaAdresiAyni && teslimatTipi === 'adres'}
                />
                <button
                  className="w-full py-2 text-center text-primary hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setAdresFormOpen('fatura')}
                >
                  <FaPlus className="text-xs" /> Yeni Fatura Adresi Ekle
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