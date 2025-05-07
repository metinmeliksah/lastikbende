'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Building2, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

type PaymentMethod = 'credit-card' | 'bank-transfer';
type CardType = 'visa' | 'mastercard' | 'amex' | 'troy' | null;
type CardSide = 'front' | 'back';

interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

interface SepetUrunu {
  id: number;
  isim: string;
  ebat: string;
  fiyat: number;
  adet: number;
  resim: string;
}

interface TeslimatBilgileri {
  tip: 'magaza' | 'adres';
  magaza: {
    id: number;
    isim: string;
    adres: string;
  } | null;
  teslimatAdresi: {
    id: number;
    baslik: string;
    isim: string;
    adres: string;
    sehir: string;
    telefon: string;
  } | null;
}

interface SepetVerisi {
  urunler: SepetUrunu[];
  toplamTutar: number;
  kargo: number;
  genelToplam: number;
  teslimatBilgileri: TeslimatBilgileri;
  faturaAdresi: {
    id: number;
    baslik: string;
    isim: string;
    adres: string;
    sehir: string;
    telefon: string;
  };
}

interface SiparisResponse {
  success: boolean;
  message: string;
  siparisNo?: string;
  error?: string;
}

const OdemePage = () => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [cardType, setCardType] = useState<CardType>(null);
  const [cardSide, setCardSide] = useState<CardSide>('front');
  const [sepetVerisi, setSepetVerisi] = useState<SepetVerisi | null>(null);
  const [sozlesmeMetni, setSozlesmeMetni] = useState('');
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Sepet verisini localStorage'dan al
    const sepetData = localStorage.getItem('sepetVerisi');
    if (sepetData) {
      setSepetVerisi(JSON.parse(sepetData));
    }

    // Mesafeli satış sözleşmesi metnini al
    fetch('/api/sozlesme/mesafeli-satis')
      .then(res => res.text())
      .then(metin => setSozlesmeMetni(metin))
      .catch(err => console.error('Sözleşme metni alınamadı:', err));
  }, []);

  const isFormValid = () => {
    if (paymentMethod === 'credit-card') {
      const { cardNumber, cardHolder, expiryDate, cvv } = paymentFormData;
      const isAmex = cardNumber.startsWith('3');
      const validCardLength = isAmex ? cardNumber.replace(/\s/g, '').length === 15 : cardNumber.replace(/\s/g, '').length === 16;
      const validCvvLength = isAmex ? cvv.length === 4 : cvv.length === 3;
      
      return (
        validCardLength &&
        cardHolder.trim().length > 0 &&
        /^\d{2}\/\d{2}$/.test(expiryDate) &&
        validCvvLength &&
        cardType !== null
      );
    }
    return true;
  };

  const isValidCardNumber = (number: string) => {
    const firstDigit = number.charAt(0);
    return !['1', '2', '7', '8', '0'].includes(firstDigit);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const firstDigit = digits.charAt(0);
    
    if (!isValidCardNumber(digits)) return '';
    
    // AMEX format (15 digits: XXXX XXXXXX XXXXX)
    if (firstDigit === '3') {
      return digits
        .slice(0, 15)
        .replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
        .trim();
    }
    
    // Other cards format (16 digits: XXXX XXXX XXXX XXXX)
    return digits
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  };

  const determineCardType = (number: string): CardType => {
    const firstDigit = number.charAt(0);
    if (!firstDigit) return null;
    
    switch (firstDigit) {
      case '4': return 'visa';
      case '5': return 'mastercard';
      case '3': return 'amex';
      case '6':
      case '9': return 'troy';
      default: return null;
    }
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        const newCardType = determineCardType(formattedValue);
        setCardType(newCardType);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        const isAmex = paymentFormData.cardNumber.startsWith('3');
        formattedValue = value.replace(/\D/g, '').slice(0, isAmex ? 4 : 3);
        break;
      case 'cardHolder':
        formattedValue = value.toUpperCase();
        break;
    }

    setPaymentFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurunuz.');
      return;
    }

    if (!isAgreementAccepted) {
      toast.error('Lütfen sözleşmeleri kabul ediniz.');
      return;
    }
    
    try {
      // Simüle edilmiş başarılı sipariş yanıtı
      const siparisNo = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('siparisNo', siparisNo);
      
      // Başarılı sipariş durumunda onay sayfasına yönlendir
      router.push('/sepet/odeme/onay');
    } catch (error) {
      toast.error('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Sipariş oluşturma hatası:', error);
    }
  };

  return (
    <main className="min-h-screen bg-dark-400 pt-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Ödeme</h1>

        {/* Sipariş Özeti */}
        {sepetVerisi && (
          <div className="bg-dark-300 rounded-lg p-4 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="text-primary" />
              Sipariş Özeti
            </h2>
            <div className="space-y-6">
              <div className="space-y-4">
                {sepetVerisi.urunler.map((urun) => (
                  <div key={urun.id} className="flex items-center gap-4 border-b border-gray-700 pb-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-800">
                      <Image
                        src={urun.resim}
                        alt={urun.isim}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{urun.isim}</h3>
                      <p className="text-gray-400">{urun.ebat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{(urun.fiyat * urun.adet).toLocaleString('tr-TR')} ₺</p>
                      <p className="text-sm text-gray-400">{urun.adet} adet</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-white font-medium mb-2">Teslimat Bilgileri</h3>
                  <p className="text-gray-400">
                    {sepetVerisi.teslimatBilgileri.tip === 'magaza' 
                      ? `Mağazada Montaj: ${sepetVerisi.teslimatBilgileri.magaza?.isim}`
                      : `Adrese Teslimat: ${sepetVerisi.teslimatBilgileri.teslimatAdresi?.adres}`
                    }
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Fatura Adresi</h3>
                  <p className="text-gray-400">{sepetVerisi.faturaAdresi.isim}</p>
                  <p className="text-gray-400">{sepetVerisi.faturaAdresi.adres}</p>
                  <p className="text-gray-400">{sepetVerisi.faturaAdresi.sehir}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Ödeme Seçenekleri */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ödeme Yöntemi Modülü */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="text-primary" />
                Ödeme Yöntemi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg cursor-pointer border transition-colors flex items-center gap-3 ${
                    paymentMethod === 'credit-card'
                      ? 'border-primary bg-dark-200'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setPaymentMethod('credit-card')}
                >
                  <CreditCard className="text-primary text-xl" />
                  <div>
                    <p className="font-medium text-white">Kredi Kartı</p>
                    <p className="text-sm text-gray-400">Güvenli ödeme</p>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg cursor-pointer border transition-colors flex items-center gap-3 ${
                    paymentMethod === 'bank-transfer'
                      ? 'border-primary bg-dark-200'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setPaymentMethod('bank-transfer')}
                >
                  <Building2 className="text-primary text-xl" />
                  <div>
                    <p className="font-medium text-white">Havale/EFT</p>
                    <p className="text-sm text-gray-400">Banka havalesi ile ödeme</p>
                  </div>
                </div>
              </div>

              {/* Kart Önizleme */}
              {paymentMethod === 'credit-card' && (
                <div className="mb-6 relative">
                  <div className={`w-full max-w-md mx-auto h-56 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-xl p-6 relative overflow-hidden transition-all duration-500 shadow-xl ${
                    cardSide === 'back' ? 'transform rotate-y-180' : ''
                  }`}>
                    {cardSide === 'front' ? (
                      <div className="flex flex-col justify-between h-full relative">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
                            <div className="w-8 h-6 border-2 border-yellow-300/50 rounded-sm"></div>
                          </div>
                          {cardType && (
                            <div className="absolute top-0 right-0">
                              <Image
                                src={`/card-logos/${cardType}.svg`}
                                alt={cardType}
                                width={60}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-6">
                          <div className="text-white text-2xl tracking-[0.2em] text-center font-mono">
                            {paymentFormData.cardNumber || 'XXXX XXXX XXXX XXXX'}
                          </div>
                          <div className="grid grid-cols-2 items-end">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-300 uppercase tracking-wider">Kart Sahibi</div>
                              <div className="font-medium text-white tracking-wider">
                                {paymentFormData.cardHolder || 'AD SOYAD'}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-xs text-gray-300 uppercase tracking-wider">Son Kullanma</div>
                              <div className="font-medium text-white tracking-wider">
                                {paymentFormData.expiryDate || 'AA/YY'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center transform rotate-y-180">
                        <div className="w-full h-12 bg-black mb-6" />
                        <div className="bg-gradient-to-r from-gray-200 to-white h-12 relative">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-4 py-1 text-gray-900 tracking-widest font-mono">
                            {paymentFormData.cvv || 'XXX'}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Kart Bilgi Formu */}
              {paymentMethod === 'credit-card' ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Kart Numarası
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentFormData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Kart Üzerindeki İsim
                    </label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={paymentFormData.cardHolder}
                      onChange={handleInputChange}
                      placeholder="AD SOYAD"
                      className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentFormData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="AA/YY"
                        maxLength={5}
                        className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentFormData.cvv}
                        onChange={handleInputChange}
                        onFocus={() => setCardSide('back')}
                        onBlur={() => setCardSide('front')}
                        placeholder={cardType === 'amex' ? '4 haneli' : '3 haneli'}
                        maxLength={cardType === 'amex' ? 4 : 3}
                        className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-white font-medium mb-2">Banka Hesap Bilgileri</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>Banka: Ziraat Bankası</p>
                      <p>IBAN: TR12 3456 7890 1234 5678 9012 34</p>
                      <p>Hesap Sahibi: LastikBende A.Ş.</p>
                    </div>
                  </div>
                  <div className="bg-dark-400 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-white font-medium mb-2">Banka Hesap Bilgileri</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>Banka: İş Bankası</p>
                      <p>IBAN: TR42 3456 7890 1234 5678 9012 99</p>
                      <p>Hesap Sahibi: LastikBende A.Ş.</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Havale/EFT işleminizi gerçekleştirdikten sonra siparişiniz onaylanacaktır. Sipariş numaranızı açıklama kısmına yazmayı unutmayınız.
                  </p>
                </div>
              )}
            </div>

            {/* Sözleşmeler Modülü */}
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="text-primary" />
                Sözleşmeler
              </h2>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Ön Bilgilendirme Formu</h3>
                <div className="h-40 overflow-y-auto bg-dark-400 rounded-lg p-4 text-gray-300">
                  {sepetVerisi && (
                    <div className="prose prose-invert max-w-none">
                      <h4 className="text-lg font-medium mb-4">1. TARAFLAR</h4>
                      <p className="mb-4">
                        <strong>SATICI:</strong><br />
                        Ünvan: LastikBende A.Ş.<br />
                        Adres: Merkez Mah. Lastik Sok. No:1 İstanbul<br />
                        Tel: 0850 123 4567<br />
                        E-posta: info@lastikbende.com
                      </p>
                      <p className="mb-4">
                        <strong>ALICI:</strong><br />
                        Ad Soyad: {sepetVerisi.faturaAdresi.isim}<br />
                        Adres: {sepetVerisi.faturaAdresi.adres}<br />
                        Tel: {sepetVerisi.faturaAdresi.telefon}
                      </p>
                      <h4 className="text-lg font-medium mb-4">2. ÜRÜN BİLGİLERİ</h4>
                      {sepetVerisi.urunler.map((urun) => (
                        <div key={urun.id} className="mb-2">
                          <p>
                            {urun.isim} ({urun.ebat}) - {urun.adet} adet<br />
                            Birim Fiyat: {urun.fiyat.toLocaleString('tr-TR')} ₺<br />
                            Toplam: {(urun.fiyat * urun.adet).toLocaleString('tr-TR')} ₺
                          </p>
                        </div>
                      ))}
                      <h4 className="text-lg font-medium mb-4">3. TESLİMAT BİLGİLERİ</h4>
                      <p>
                        Teslimat Şekli: {sepetVerisi.teslimatBilgileri.tip === 'magaza' ? 'Mağazada Montaj' : 'Adrese Teslimat'}<br />
                        {sepetVerisi.teslimatBilgileri.tip === 'magaza' ? (
                          <>
                            Mağaza: {sepetVerisi.teslimatBilgileri.magaza?.isim}<br />
                            Adres: {sepetVerisi.teslimatBilgileri.magaza?.adres}
                          </>
                        ) : (
                          <>
                            Teslimat Adresi: {sepetVerisi.teslimatBilgileri.teslimatAdresi?.adres}<br />
                            {sepetVerisi.teslimatBilgileri.teslimatAdresi?.sehir}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Mesafeli Satış Sözleşmesi</h3>
                <div className="h-40 overflow-y-auto bg-dark-400 rounded-lg p-4 text-gray-300">
                  {sepetVerisi && (
                    <div className="prose prose-invert max-w-none">
                      <h4 className="text-lg font-medium mb-4">MADDE 1 - TARAFLAR</h4>
                      <p className="mb-4">
                        <strong>SATICI:</strong><br />
                        Ünvan: LastikBende A.Ş.<br />
                        Adres: Merkez Mah. Lastik Sok. No:1 İstanbul<br />
                        Tel: 0850 123 4567<br />
                        E-posta: info@lastikbende.com
                      </p>
                      <p className="mb-4">
                        <strong>ALICI:</strong><br />
                        Ad Soyad: {sepetVerisi.faturaAdresi.isim}<br />
                        Adres: {sepetVerisi.faturaAdresi.adres}<br />
                        Tel: {sepetVerisi.faturaAdresi.telefon}
                      </p>
                      <h4 className="text-lg font-medium mb-4">MADDE 2 - KONU</h4>
                      <p className="mb-4">
                        İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini verdiği
                        aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı
                        Tüketicinin Korunması Hakkında Kanun hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
                      </p>
                      <h4 className="text-lg font-medium mb-4">MADDE 3 - ÜRÜN BİLGİLERİ</h4>
                      {sepetVerisi.urunler.map((urun) => (
                        <div key={urun.id} className="mb-2">
                          <p>
                            {urun.isim} ({urun.ebat})<br />
                            Adet: {urun.adet}<br />
                            Birim Fiyat: {urun.fiyat.toLocaleString('tr-TR')} ₺<br />
                            Toplam: {(urun.fiyat * urun.adet).toLocaleString('tr-TR')} ₺
                          </p>
                        </div>
                      ))}
                      <p className="mb-4">
                        Teslimat Ücreti: {sepetVerisi.kargo === 0 ? 'Ücretsiz' : sepetVerisi.kargo.toLocaleString('tr-TR') + ' ₺'}<br />
                        Toplam Ödeme: {sepetVerisi.genelToplam.toLocaleString('tr-TR')} ₺
                      </p>
                      <h4 className="text-lg font-medium mb-4">MADDE 4 - TESLİMAT</h4>
                      <p className="mb-4">
                        Teslimat Şekli: {sepetVerisi.teslimatBilgileri.tip === 'magaza' ? 'Mağazada Montaj' : 'Adrese Teslimat'}<br />
                        {sepetVerisi.teslimatBilgileri.tip === 'magaza' ? (
                          <>
                            Mağaza: {sepetVerisi.teslimatBilgileri.magaza?.isim}<br />
                            Adres: {sepetVerisi.teslimatBilgileri.magaza?.adres}
                          </>
                        ) : (
                          <>
                            Teslimat Adresi: {sepetVerisi.teslimatBilgileri.teslimatAdresi?.adres}<br />
                            {sepetVerisi.teslimatBilgileri.teslimatAdresi?.sehir}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Sipariş Özeti Modülü */}
          <div className="space-y-4">
            <div className="bg-dark-300 rounded-lg p-4 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="text-primary" />
                Sipariş Tutarı
              </h2>
              {sepetVerisi && (
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Ara Toplam</span>
                    <span>{sepetVerisi.toplamTutar.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Kargo</span>
                    <span className="text-green-500">Ücretsiz</span>
                  </div>
                  <div className="border-t border-gray-700 my-2 pt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Toplam</span>
                      <span>{sepetVerisi.genelToplam.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sözleşme Onayı ve Sipariş Butonu */}
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreementAccept"
                    checked={isAgreementAccepted}
                    onChange={(e) => setIsAgreementAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary bg-dark-400 border-gray-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="agreementAccept" className="text-sm text-gray-300">
                    <Link href="/sozlesmeler/mesafeli-satis-sozlesmesi" className="text-primary hover:text-primary/80">
                      Mesafeli Satış Sözleşmesi
                    </Link>
                    'ni ve{' '}
                    <Link href="/sozlesmeler/on-bilgilendirme-formu" className="text-primary hover:text-primary/80">
                      Ön Bilgilendirme Formu
                    </Link>
                    'nu okudum ve kabul ediyorum.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={!isAgreementAccepted || !isFormValid()}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Siparişi Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OdemePage; 