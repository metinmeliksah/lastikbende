'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaTrash, FaMinus, FaPlus, FaTruck, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa'

export default function SepetPage() {
  // Örnek sepet verisi
  const [sepetUrunler, setSepetUrunler] = useState([
    {
      id: 1,
      isim: "Michelin Pilot Sport 4",
      ebat: "225/45 R17",
      fiyat: 2850,
      adet: 2,
      resim: "/lastik-ornegi.jpg"
    },
    {
      id: 2,
      isim: "Bridgestone Turanza T005",
      ebat: "205/55 R16",
      fiyat: 2450,
      adet: 1,
      resim: "/lastik-ornegi.jpg"
    }
  ])

  const [adresler] = useState([
    {
      id: 1,
      baslik: "Ev Adresi",
      isim: "Ahmet Yılmaz",
      adres: "Atatürk Mah. Cumhuriyet Cad. No:123 D:4",
      sehir: "İstanbul",
      telefon: "0532 123 45 67"
    },
    {
      id: 2,
      baslik: "İş Adresi",
      isim: "Ahmet Yılmaz",
      adres: "Merkez Mah. İstiklal Cad. No:45 K:3",
      sehir: "İstanbul",
      telefon: "0532 123 45 67"
    }
  ])

  const [secilenAdres, setSecilenAdres] = useState(1)

  // Adet güncelleme fonksiyonu
  const adetGuncelle = (urunId: number, yeniAdet: number) => {
    setSepetUrunler(sepetUrunler.map(urun => 
      urun.id === urunId ? { ...urun, adet: Math.max(1, yeniAdet) } : urun
    ))
  }

  // Ürün silme fonksiyonu
  const urunSil = (urunId: number) => {
    setSepetUrunler(sepetUrunler.filter(urun => urun.id !== urunId))
  }

  // Toplam tutarı hesapla
  const toplamTutar = sepetUrunler.reduce((total, urun) => total + (urun.fiyat * urun.adet), 0)
  const kargo = 0 // Ücretsiz kargo
  const genelToplam = toplamTutar + kargo

  return (
    <div className="min-h-screen bg-dark-400 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Ürün Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {sepetUrunler.length > 0 ? (
              sepetUrunler.map((urun) => (
                <div key={urun.id} className="bg-dark-300 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-4">
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

          {/* Sağ Taraf - Sipariş Özeti ve Adres */}
          <div className="space-y-4">
            {/* Adres Seçimi */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                Teslimat Adresi
              </h2>
              <div className="space-y-3">
                {adresler.map((adres) => (
                  <div
                    key={adres.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      secilenAdres === adres.id
                        ? 'border-primary bg-dark-200'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSecilenAdres(adres.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white">{adres.baslik}</p>
                        <p className="text-sm text-gray-400 mt-1">{adres.isim}</p>
                        <p className="text-sm text-gray-400">{adres.adres}</p>
                        <p className="text-sm text-gray-400">{adres.sehir}</p>
                        <p className="text-sm text-gray-400">{adres.telefon}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2 text-center text-primary hover:text-red-400 transition-colors">
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
                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaTruck />
                Siparişi Onayla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 