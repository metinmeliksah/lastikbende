import { NextResponse } from 'next/server';

/**
 * Ön Bilgilendirme Formu içeriğini döndüren API endpointi.
 */
export async function GET() {
  // Ön bilgilendirme formu statik içeriği
  const formMetni = `ÖN BİLGİLENDİRME FORMU

1. TARAFLAR

SATICI:
Ünvan: LastikBende A.Ş.
Adres: Merkez Mah. Lastik Sok. No:1 İstanbul
Tel: 0850 123 4567
E-posta: info@lastikbende.com
MERSİS No: 1234567890123456

ALICI:
(Sipariş veren kişinin bilgileri)

2. KONU

İşbu Ön Bilgilendirme Formu'nun konusu, SATICI'nın, ALICI'ya satışını yaptığı ürünlerin temel nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları ve benzeri konularda ALICI'yı bilgilendirme yükümlülüğünü yerine getirmesidir.

3. SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER

Ürünlerin cinsi ve türü, miktarı, marka/modeli, satış bedeli ve teslimat bilgileri sipariş formunda belirtildiği gibidir.

4. ÖDEME BİLGİLERİ

Ödemeler kredi kartı, banka havalesi veya EFT yöntemleriyle yapılabilir. Kredi kartı ile ödemelerde taksit imkanları bankalarla belirlenen koşullar dahilinde sağlanmaktadır.

5. TESLİMAT BİLGİLERİ

Teslimat, anlaşmalı kargo şirketleri aracılığıyla veya mağazalarımızda montaj şeklinde yapılmaktadır. Kargo ile teslimat süresi, sipariş onayından sonra 3-5 iş günü içerisindedir.

6. CAYMA HAKKI

ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, mal satışına ilişkin işlemlerde teslimat tarihinden itibaren 14 (ondört) gün içerisinde malı reddederek sözleşmeden cayma hakkına sahiptir.

7. UYUŞMAZLIK ÇÖZÜMÜ

İşbu Ön Bilgilendirme Formu'ndan doğan uyuşmazlıklarda, Gümrük ve Ticaret Bakanlığı'nca her yıl ilan edilen değere kadar Tüketici Hakem Heyetleri, bu değerin üzerindeki uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.`;

  return new Response(formMetni, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'max-age=3600' // 1 saat önbellek
    }
  });
} 