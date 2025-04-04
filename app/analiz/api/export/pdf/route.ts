import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { cacheAdapter, createCacheKey } from '../../../lib/cacheAdapter';

// Tip tanımlamaları
interface Problem {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// PDF formatındaki raporları oluşturacak API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const analizVerileri = await request.json();
    
    // Yazdırma modu kontrolü
    const { searchParams } = new URL(request.url);
    const forPrinting = searchParams.get('forPrinting') === 'true';
    
    // Önbellekleme için anahtar oluştur
    const cacheKey = createCacheKey(`pdf_${forPrinting ? 'print' : 'download'}`, analizVerileri);
    
    // Önbellekte var mı kontrol et
    const cachedPdf = await cacheAdapter.get(cacheKey);
    if (cachedPdf) {
      console.log(`[PDF API] Cache HIT: ${cacheKey}`);
      return new NextResponse(cachedPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': forPrinting 
            ? 'inline; filename=lastik-analiz-raporu.pdf' 
            : 'attachment; filename=lastik-analiz-raporu.pdf',
          'X-Cache': 'HIT' // Debug için yararlı
        }
      });
    }
    
    console.log(`[PDF API] Cache MISS: ${cacheKey}`);
    
    // Gelen veriyi formatla
    const formattedData = {
      lastikBilgileri: {
        marka: analizVerileri.lastikBilgileri?.marka || 'Belirtilmemiş',
        model: analizVerileri.lastikBilgileri?.model || 'Belirtilmemiş',
        boyut: analizVerileri.lastikBilgileri?.boyut || 'Belirtilmemiş',
        uretimYili: analizVerileri.lastikBilgileri?.uretimYili || 'Belirtilmemiş',
        kilometre: analizVerileri.lastikBilgileri?.kilometre || '0'
      },
      analizSonuclari: {
        genelDurum: analizVerileri.analizSonuclari?.genelDurum || 'Belirtilmemiş',
        disDerinligi: analizVerileri.analizSonuclari?.disDerinligi || '0',
        yanakDurumu: analizVerileri.analizSonuclari?.yanakDurumu || 'Belirtilmemiş',
        asinmaOrani: analizVerileri.analizSonuclari?.asinmaOrani || '0',
        guvenlikSkoru: analizVerileri.analizSonuclari?.guvenlikSkoru || '0'
      },
      tahminiBilgiler: {
        tahminiOmur: analizVerileri.tahminiBilgiler?.tahminiOmur || { km: 0, ay: 0 },
        onerilenBakimlar: analizVerileri.tahminiBilgiler?.onerilenBakimlar || [],
        sorunlar: analizVerileri.tahminiBilgiler?.sorunlar || []
      },
      metaVeriler: {
        analizTarihi: analizVerileri.metaVeriler?.analizTarihi || new Date().toISOString(),
        raporId: analizVerileri.metaVeriler?.raporId || `lastik-${Date.now()}`,
        surumNo: analizVerileri.metaVeriler?.surumNo || "1.0"
      }
    };
    
    // Güvenlik skoru rengini ve durum metnini belirle
    const guvenlikSkoru = formattedData.analizSonuclari.guvenlikSkoru;
    let guvenlikRenk = '#F44336'; // Kırmızı
    let guvenlikDurum = 'Kritik';
    
    if (Number(guvenlikSkoru) >= 80) {
      guvenlikRenk = '#4CAF50'; // Yeşil
      guvenlikDurum = 'İyi';
    } else if (Number(guvenlikSkoru) >= 60) {
      guvenlikRenk = '#FF9800'; // Turuncu
      guvenlikDurum = 'Orta';
    }
    
    // Tarih formatı
    const tarih = new Date();
    const formatliTarih = tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Tahmini ömür değerleri
    const tahminiKm = formattedData.tahminiBilgiler.tahminiOmur.km.toLocaleString('tr-TR');
    const tahminiAy = formattedData.tahminiBilgiler.tahminiOmur.ay;
    
    // Ana tema rengi - yazdırma için koyu tonları değiştir
    const primaryColor = forPrinting ? '#9C27B0' : '#FF4444';
    const secondaryColor = forPrinting ? '#333333' : '#1E1E1E';
    
    // Renk paletleri
    const forPrintingColors = {
      bg: '#ffffff',
      text: '#333333',
      title: '#9C27B0',
      subtitle: '#555555',
      sectionBg: '#f9f9f9',
      border: '#e0e0e0',
      boxBg: '#ffffff',
      boxBorder: '#e5e5e5',
      boxShadow: '0.1',
      footer: '#777777'
    };

    const screenColors = {
      bg: '#1a1a1a',
      text: '#e0e0e0',
      title: '#FF4444',
      subtitle: '#bbbbbb',
      sectionBg: '#222222',
      border: '#333333',
      boxBg: '#2a2a2a',
      boxBorder: '#444444',
      boxShadow: '0.3',
      footer: '#999999'
    };
    
    // PDF içeriği için HTML şablonu
    const html = createPdfHtml(
      formattedData,
      guvenlikSkoru,
      guvenlikRenk,
      guvenlikDurum,
      tahminiKm,
      tahminiAy,
      formatliTarih,
      primaryColor,
      secondaryColor,
      forPrinting,
      forPrintingColors,
      screenColors
    );
    
    // Puppeteer ile PDF oluştur
    const browser = await puppeteer.launch({
      headless: true, // headless: 'new' yerine boolean olarak kullanılmalı
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Bellek kullanımını iyileştirir
        '--disable-accelerated-2d-canvas', // Bellek kullanımını azaltır
        '--no-first-run',
        '--disable-extensions'
      ]
    });
    
    const page = await browser.newPage();
    
    // PDF için ek yapılandırmalar
    if (forPrinting) {
      await page.emulateMediaType('print');
    }
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Yazdırma için optimize edilmiş PDF ayarları
    const pdfOptions = {
      format: 'a4' as 'a4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      preferCSSPageSize: forPrinting,
      displayHeaderFooter: false,
      scale: forPrinting ? 0.98 : 1.0, // Yazdırma için ölçeği biraz küçült, sayfa taşmasını önle
    };
    
    // Yazdırma için ek ayarlar
    if (forPrinting) {
      // Daha iyi yazdırma optimizasyonu için sayfayı hazırla
      await page.evaluate(() => {
        document.body.classList.add('printing-mode');
        
        // Yazdırma sırasında font sorunlarını önlemek için 
        const style = document.createElement('style');
        style.textContent = `
          @media print {
            body, * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .section-title, .score-circle {
              color: white !important;
              -webkit-print-color-adjust: exact !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `;
        document.head.appendChild(style);
      });
    }
    
    const pdfBuffer = await page.pdf(pdfOptions);
    
    await browser.close();
    
    // PDF'i önbelleğe al (2 saat süreyle)
    await cacheAdapter.set(cacheKey, Buffer.from(pdfBuffer), 2 * 60 * 60); // 2 saat
    
    // IDM müdahalesini engelleme için header'ları güçlendir
    const inlineMode = forPrinting ? true : false;
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length.toString(),
      'Content-Disposition': inlineMode 
        ? `inline; filename="lastik-analiz-raporu.pdf"` 
        : `attachment; filename="lastik-analiz-raporu.pdf"`,
      'X-Cache': 'MISS',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Expires': '0',
      'Pragma': 'no-cache'
    };

    // Özel tarayıcı indiricisi başlıkları ekle
    if (!inlineMode) {
      headers['Content-Transfer-Encoding'] = 'binary';
      headers['X-Download-Options'] = 'noopen'; // IE10'da indirmenin otomatik açılmasını engelle
    }

    return new NextResponse(pdfBuffer, { headers });
    
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    return NextResponse.json({ error: 'PDF oluşturulurken bir hata oluştu' }, { status: 500 });
  }
}

// HTML şablonu oluşturmak için yardımcı fonksiyon
function createPdfHtml(
  formattedData: any,
  guvenlikSkoru: any,
  guvenlikRenk: string,
  guvenlikDurum: string,
  tahminiKm: string,
  tahminiAy: any,
  formatliTarih: string,
  primaryColor: string,
  secondaryColor: string,
  forPrinting: boolean,
  forPrintingColors: any,
  screenColors: any
): string {
  // Renkleri seç
  const colors = forPrinting ? forPrintingColors : screenColors;
  
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lastik Analiz Raporu</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: ${colors.text};
          background-color: ${colors.bg};
          margin: 0;
          padding: 0;
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
          max-width: 794px; /* A4 genişliği */
          margin: 0 auto;
          padding: 20px;
          background-color: ${colors.bg};
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid ${primaryColor};
        }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          color: ${primaryColor};
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .report-title {
          font-size: 18px;
          color: ${colors.subtitle};
          margin: 5px 0;
          font-weight: 400;
        }
        
        .date {
          font-size: 14px;
          color: ${colors.footer};
          margin-top: 10px;
          font-weight: 300;
        }
        
        .section {
          margin-bottom: 30px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,${forPrinting ? '0.05' : '0.2'});
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: ${colors.bg};
          background-color: ${primaryColor};
          padding: 12px 15px;
          margin: 0;
          border-radius: 8px 8px 0 0;
        }
        
        .section-content {
          padding: 15px;
          background-color: ${colors.sectionBg};
        }
        
        .summary-info {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .summary-box {
          flex: 1;
          min-width: 160px;
          padding: 15px;
          border-radius: 6px;
          background-color: ${colors.boxBg};
          border: 1px solid ${colors.boxBorder};
          box-shadow: 0 1px 6px rgba(0,0,0,${colors.boxShadow});
        }
        
        .summary-box h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 13px;
          color: ${colors.subtitle};
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .summary-box p {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: ${colors.text};
        }
        
        .score-box {
          text-align: center;
        }
        
        .score-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: ${guvenlikRenk};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          margin: 0 auto 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .problem-list, .recommendations {
          margin-top: 10px;
        }
        
        .problem-item {
          padding: 12px 15px;
          margin-bottom: 10px;
          display: flex;
          border-radius: 6px;
          background-color: ${forPrinting ? '#fff8e1' : '#332800'};
          box-shadow: 0 1px 4px rgba(0,0,0,${colors.boxShadow});
          align-items: center;
        }
        
        .problem-severity {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 15px;
          flex-shrink: 0;
        }
        
        .severity-high {
          background-color: #F44336;
          box-shadow: 0 0 8px rgba(244,67,54,0.5);
        }
        
        .severity-medium {
          background-color: #FF9800;
          box-shadow: 0 0 8px rgba(255,152,0,0.5);
        }
        
        .severity-low {
          background-color: #4CAF50;
          box-shadow: 0 0 8px rgba(76,175,80,0.5);
        }
        
        .recommendation-item {
          padding: 12px 15px;
          margin-bottom: 10px;
          border-left: 4px solid ${primaryColor};
          background-color: ${colors.boxBg};
          border-radius: 0 6px 6px 0;
          box-shadow: 0 1px 4px rgba(0,0,0,${colors.boxShadow});
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid ${colors.border};
          font-size: 12px;
          color: ${colors.footer};
          text-align: center;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .watermark {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 11px;
          color: ${forPrinting ? '#cccccc' : '#444444'};
          opacity: 0.5;
        }
        
        @media print {
          body {
            color: #333333;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .container {
            width: 100%;
            max-width: 100%;
            padding: 15px;
            box-shadow: none;
          }
          
          .section {
            margin-bottom: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .section-title {
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          a {
            text-decoration: none;
            color: #000;
          }
          
          .score-circle {
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="company-name">LASTİKBENDE</h1>
          <p class="report-title">Lastik Analiz Raporu</p>
          <p class="date">Oluşturulma Tarihi: ${formatliTarih}</p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Lastik Bilgileri</h2>
          <div class="section-content">
            <div class="summary-info">
              <div class="summary-box">
                <h3>Marka</h3>
                <p>${formattedData.lastikBilgileri.marka}</p>
              </div>
              <div class="summary-box">
                <h3>Model</h3>
                <p>${formattedData.lastikBilgileri.model}</p>
              </div>
              <div class="summary-box">
                <h3>Ebat</h3>
                <p>${formattedData.lastikBilgileri.boyut}</p>
              </div>
              <div class="summary-box">
                <h3>Üretim Yılı</h3>
                <p>${formattedData.lastikBilgileri.uretimYili}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Analiz Sonuçları</h2>
          <div class="section-content">
            <div class="summary-info">
              <div class="summary-box score-box">
                <h3>Güvenlik Skoru</h3>
                <div class="score-circle">${guvenlikSkoru}</div>
                <p style="text-align: center; margin-top: 5px; font-size: 16px; color: ${guvenlikRenk}; font-weight: bold;">${guvenlikDurum}</p>
              </div>
              <div class="summary-box">
                <h3>Genel Durum</h3>
                <p>${formattedData.analizSonuclari.genelDurum}</p>
              </div>
              <div class="summary-box">
                <h3>Diş Derinliği</h3>
                <p>${formattedData.analizSonuclari.disDerinligi} mm</p>
              </div>
              <div class="summary-box">
                <h3>Yanak Durumu</h3>
                <p>${formattedData.analizSonuclari.yanakDurumu}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Tahmini Ömür</h2>
          <div class="section-content">
            <div class="summary-info">
              <div class="summary-box">
                <h3>Tahmini Kilometre</h3>
                <p>${tahminiKm} km</p>
              </div>
              <div class="summary-box">
                <h3>Tahmini Süre</h3>
                <p>${tahminiAy} ay</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Tespit Edilen Sorunlar</h2>
          <div class="section-content">
            <div class="problem-list">
              ${formattedData.tahminiBilgiler.sorunlar.map((sorun: Problem) => `
                <div class="problem-item">
                  <div class="problem-severity severity-${sorun.severity}"></div>
                  <div>
                    <strong>${sorun.type}:</strong> ${sorun.description}
                  </div>
                </div>
              `).join('')}
              ${formattedData.tahminiBilgiler.sorunlar.length === 0 ? '<p>Herhangi bir sorun tespit edilmedi.</p>' : ''}
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Bakım Önerileri</h2>
          <div class="section-content">
            <div class="recommendations">
              ${formattedData.tahminiBilgiler.onerilenBakimlar.map((oneri: string) => `
                <div class="recommendation-item">
                  ${oneri}
                </div>
              `).join('')}
              ${formattedData.tahminiBilgiler.onerilenBakimlar.length === 0 ? '<p>Herhangi bir bakım önerisi bulunmuyor.</p>' : ''}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu rapor LastikBende uygulaması tarafından otomatik olarak oluşturulmuştur.</p>
          <p>Rapor No: ${formattedData.metaVeriler.raporId}</p>
          <p>Sürüm: ${formattedData.metaVeriler.surumNo}</p>
          <p>© ${new Date().getFullYear()} LastikBende - Tüm Hakları Saklıdır</p>
        </div>
        
        <div class="watermark">
          lastikbende.com
        </div>
      </div>
    </body>
    </html>
  `;
} 