import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET() {
  try {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = currentPage.getSize();
    const fontSize = 12;
    const lineHeight = 15;
    let y = height - 50;

    // Add title
    currentPage.drawText('ÜYELİK SÖZLEŞMESİ', {
      x: 50,
      y,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Add version and date info
    currentPage.drawText('Versiyon: 1.0.0', {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;

    currentPage.drawText('Geçerlilik Tarihi: 2024-01-01', {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight * 2;

    // Add agreement content with new sections
    const content = [
      '1. TARAFLAR',
      'Bu üyelik sözleşmesi ("Sözleşme"), LastikBende (bundan böyle "Platform" olarak anılacaktır) ile üyelik başvurusunda bulunan kullanıcı ("Üye") arasında dijital ortamda kabul edilerek yürürlüğe girmiştir.',
      '',
      '2. KONU',
      'İşbu sözleşme, Platform\'a üye olacak kişilerin, Platform üzerinden sunulan lastik analizi, karşılaştırma ve satın alma hizmetlerinden yararlanma koşullarını ve tarafların hak ve yükümlülüklerini düzenler.',
      '',
      '3. ÜYELİK KOŞULLARI',
      'Üyelik için; 18 yaşını doldurmuş olmak, doğru ve güncel bilgilerle başvuru yapmak, sözleşme şartlarını kabul etmiş olmak gereklidir. Platform, başvuru yapan kişinin üyelik talebini sebep göstermeksizin reddetme hakkını saklı tutar. Üye, başvuru sırasında verdiği bilgilerin doğruluğunu taahhüt eder.',
      '',
      '4. KULLANICI YÜKÜMLÜLÜKLERİ',
      'Üye, Platform\'u hukuka ve ahlaka aykırı biçimde kullanmayacağını, hesap bilgilerini başkalarıyla paylaşmayacağını, hizmetlerin güvenliğini tehdit edecek girişimlerde bulunmayacağını kabul eder. Ayrıca, Platform üzerinden yapacağı tüm işlemlerde yasal düzenlemelere uygun hareket edeceğini taahhüt eder.',
      '',
      '5. PLATFORM\'UN HAKLARI',
      'Platform; hizmet içeriğini, üyelik koşullarını ve sözleşmeyi her zaman güncelleme, kullanıcıyı bilgilendirerek hizmeti durdurma hakkını saklı tutar. Platform, sunduğu hizmetlerin kesintisiz ve hatasız olacağını garanti etmez, gerekli gördüğü durumlarda hizmetleri geçici olarak durdurabilir.',
      '',
      '6. SÖZLEŞMENİN SÜRESİ VE FESHİ',
      'Bu sözleşme, kullanıcı üyeliği devam ettiği sürece geçerlidir. Üye dilediği zaman üyeliğini sonlandırabilir. Platform, sözleşme şartlarının ihlali halinde üyeliği askıya alabilir veya sona erdirebilir. Fesih durumunda üyenin verileri yasal süre boyunca saklanır.',
      '',
      '7. GİZLİLİK VE KİŞİSEL VERİLER',
      'Platform, üyeye ait kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işler. Toplanan veriler arasında ad-soyad, iletişim bilgileri, araç bilgileri ve kullanım verileri yer alır. Gizlilik politikamıza web sitemizden ulaşabilirsiniz.',
      '',
      '8. KABUL KAYDI',
      'Üye, bu sözleşmeyi elektronik ortamda onayladığı anda sözleşme yürürlüğe girer. Onay zamanı, kullanıcı IP bilgileri ile birlikte sistemde güvenli şekilde kayıt altına alınır. Platform, bu kayıtları yasal süre boyunca saklar.',
      '',
      '9. UYUŞMAZLIKLARIN ÇÖZÜMÜ',
      'Bu sözleşmeden doğacak her türlü uyuşmazlıkta İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir. Taraflar, uyuşmazlıkların çözümünde öncelikle karşılıklı görüşme yolunu tercih edeceklerini kabul ederler.',
      '',
      '10. İLETİŞİM',
      'Sözleşmeyle ilgili sorularınız için web sitemizdeki iletişim formu üzerinden veya support@lastikbende.com e-posta adresi üzerinden bizimle iletişime geçebilirsiniz.'
    ];

    for (const line of content) {
      if (y < 50) {
        currentPage = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }
      
      currentPage.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    // Set appropriate headers for PDF download
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="uyelik-sozlesmesi.pdf"',
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 