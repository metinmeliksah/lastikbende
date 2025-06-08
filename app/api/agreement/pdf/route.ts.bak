import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET() {
  try {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const { width, height } = currentPage.getSize();
    const fontSize = 12;
    const lineHeight = 15;
    let y = height - 50;

    // Add title
    currentPage.drawText('UYELIK SOZLESMESI', {
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

    currentPage.drawText('Gecerlilik Tarihi: 2024-01-01', {
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
      'Bu uyelik sozlesmesi ("Sozlesme"), LastikBende (bundan boyle "Platform" olarak anilacaktir) ile uyelik basvurusunda bulunan kullanici ("Uye") arasinda dijital ortamda kabul edilerek yururluge girmistir.',
      '',
      '2. KONU',
      'Isbu sozlesme, Platform\'a uye olacak kisilerin, Platform uzerinden sunulan lastik analizi, karsilastirma ve satin alma hizmetlerinden yararlanma kosullarini ve taraflarin hak ve yukumluluklerini duzenler.',
      '',
      '3. UYELIK KOSULLARI',
      'Uyelik icin; 18 yasini doldurmus olmak, dogru ve guncel bilgilerle basvuru yapmak, sozlesme sartlarini kabul etmis olmak gereklidir. Platform, basvuru yapan kisinin uyelik talebini sebep gostermeksizin reddetme hakkini sakli tutar. Uye, basvuru sirasinda verdigi bilgilerin dogrulugunu taahhut eder.',
      '',
      '4. KULLANICI YUKUMLULUKLERI',
      'Uye, Platform\'u hukuka ve ahlaka aykiri bicimde kullanmayacagini, hesap bilgilerini baskalarinla paylasmayacagini, hizmetlerin guvenligini tehdit edecek girisimlerde bulunmayacagini kabul eder. Ayrica, Platform uzerinden yapacagi tum islemlerde yasal duzenlemelere uygun hareket edecegini taahhut eder.',
      '',
      '5. PLATFORM\'UN HAKLARI',
      'Platform; hizmet icerigini, uyelik kosullarini ve sozlesmeyi her zaman guncelleme, kullaniciyi bilgilendirerek hizmeti durdurma hakkini sakli tutar. Platform, sundugu hizmetlerin kesintisiz ve hatasiz olacagini garanti etmez, gerekli gordugu durumlarda hizmetleri gecici olarak durdurabilir.',
      '',
      '6. SOZLESMENIN SURESI VE FESHI',
      'Bu sozlesme, kullanici uyeligi devam ettigi surece gecerlidir. Uye diledigi zaman uyeligini sonlandirabilir. Platform, sozlesme sartlarinin ihlali halinde uyeligi askiya alabilir veya sona erdirebilir. Fesih durumunda uyenin verileri yasal sure boyunca saklanir.',
      '',
      '7. GIZLILIK VE KISISEL VERILER',
      'Platform, uyeye ait kisisel verileri 6698 sayili Kisisel Verilerin Korunmasi Kanunu ("KVKK") kapsaminda isler. Toplanan veriler arasinda ad-soyad, iletisim bilgileri, arac bilgileri ve kullanim verileri yer alir. Gizlilik politikamiza web sitemizden ulasabilirsiniz.',
      '',
      '8. KABUL KAYDI',
      'Uye, bu sozlesmeyi elektronik ortamda onayladigi anda sozlesme yururluge girer. Onay zamani, kullanici IP bilgileri ile birlikte sistemde guvenli sekilde kayit altina alinir. Platform, bu kayitlari yasal sure boyunca saklar.',
      '',
      '9. UYUSMAZLIKLARIN COZUMU',
      'Bu sozlesmeden dogacak her turlu uyusmazlikta Istanbul (Anadolu) Mahkemeleri ve Icra Daireleri yetkilidir. Taraflar, uyusmazliklarin cozumunde oncelikle karsilikli gorusme yolunu tercih edeceklerini kabul ederler.',
      '',
      '10. ILETISIM',
      'Sozlesmeyle ilgili sorulariniz icin web sitemizdeki iletisim formu uzerinden veya support@lastikbende.com e-posta adresi uzerinden bizimle iletisime gecebilirsiniz.'
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