import { NextResponse } from 'next/server';

/**
 * Mesafeli Satış Sözleşmesi içeriğini döndüren API endpointi.
 */
export async function GET() {
  // Mesafeli satış sözleşmesi statik içeriği
  const sozlesmeMetni = `MESAFELI SATIŞ SÖZLEŞMESI

MADDE 1 - TARAFLAR
SATICI: LastikBende A.Ş.
Adres: Merkez Mah. Lastik Sok. No:1 İstanbul
Tel: 0850 123 4567
E-posta: info@lastikbende.com

ALICI: (Sipariş veren kişinin bilgileri)

MADDE 2 - KONU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini verdiği ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

MADDE 3 - SÖZLEŞME KONUSU ÜRÜN
Ürünlerin cinsi ve türü, miktarı, marka/modeli, satış bedeli ve teslimat bilgileri sipariş formunda belirtildiği gibidir.

MADDE 4 - GENEL HÜKÜMLER
4.1. ALICI, sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda satış için gerekli onayları verdiğini kabul eder.

4.2. Sözleşme konusu ürün, sipariş onayı e-postasının ALICI'ya gönderilmesini takip eden en geç 30 (otuz) gün içerisinde teslim edilir.

4.3. SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.

MADDE 5 - CAYMA HAKKI
ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (ondört) gün içerisinde ürünü reddederek sözleşmeden cayma hakkını kullanabilir.

MADDE 6 - UYUŞMAZLIKLARIN ÇÖZÜMÜ
İşbu sözleşmenin uygulanmasından doğan uyuşmazlıklarda, Gümrük ve Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri, bu değerin üzerindeki uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.

SATICI: LastikBende A.Ş.
ALICI: (Sipariş veren kişinin adı soyadı)
TARİH: (Sipariş tarihi)`;

  return new Response(sozlesmeMetni, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'max-age=3600' // 1 saat önbellek
    }
  });
} 