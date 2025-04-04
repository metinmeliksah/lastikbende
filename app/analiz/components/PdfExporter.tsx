'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import 'jspdf-autotable';

// jsPDF için tip genişletmesi
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PdfExporterProps {
  analizSonuclari: {
    id: string;
    genelDurum: string;
    disDerinligi: number;
    yanakDurumu: string;
    guvenlikSkoru: number;
    asinmaOrani: number;
    tahminiOmur: string;
    image?: string;
    lastik: {
      marka: string;
      model?: string;
      ebat?: string;
      dot?: string;
    };
  };
  onerilenBakimlar: string[];
  sorunlar: string[];
}

const PdfExporter: React.FC<PdfExporterProps> = ({ analizSonuclari, onerilenBakimlar, sorunlar }) => {
  const [loading, setLoading] = useState(false);

  // Türkçe karakter düzeltme fonksiyonu
  const fixTurkishChars = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/İ/g, 'I').replace(/ı/g, 'i')
      .replace(/Ş/g, 'S').replace(/ş/g, 's')
      .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
      .replace(/Ü/g, 'U').replace(/ü/g, 'u')
      .replace(/Ö/g, 'O').replace(/ö/g, 'o')
      .replace(/Ç/g, 'C').replace(/ç/g, 'c');
  };

  const handleExportPdf = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Konsol bilgisi
      console.log('PdfExporter - Lastik bilgileri:', analizSonuclari.lastik);
      
      // A4 boyutunda döküman oluştur (210x297 mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Arka planı temizleyelim
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Font tipini belirleyelim (Helvetica varsayılan)
      doc.setFont("helvetica");
      
      // Başlık bandı (mavi arka plan)
      doc.setFillColor(24, 59, 86); // Koyu mavi
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Başlık
      doc.setTextColor(255, 255, 255); // Beyaz renk
      doc.setFontSize(22);
      doc.text('LASTIK ANALIZ RAPORU', pageWidth / 2, 18, { align: 'center' });
      
      // Tarih
      const bugun = new Date();
      const tarih = fixTurkishChars(bugun.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      
      doc.setFontSize(10);
      doc.text(tarih, pageWidth - 15, 25, { align: 'right' });
      
      let yPos = 40;
      
      // Lastik bilgileri
      const lastikBilgileri = [
        { baslik: 'Marka:', deger: fixTurkishChars(analizSonuclari.lastik.marka || 'Belirtilmemis') },
        { baslik: 'Model:', deger: fixTurkishChars(analizSonuclari.lastik.model || 'Belirtilmemis') },
        { baslik: 'Ebat:', deger: fixTurkishChars(analizSonuclari.lastik.ebat || 'Belirtilmemis') },
        { baslik: 'DOT:', deger: fixTurkishChars(analizSonuclari.lastik.dot || 'Belirtilmemis') }
      ];
      
      // Lastik bilgileri başlığı
      doc.setFillColor(24, 59, 86);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text('LASTIK BILGILERI', pageWidth/2, yPos + 6.5, { align: 'center' });
      
      yPos += 15;
      
      // Lastik bilgileri içeriği - manuel tablo çizim
      for (let i = 0; i < lastikBilgileri.length; i++) {
        const { baslik, deger } = lastikBilgileri[i];
        
        // Satır arkaplanı
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        
        // Satır kenarlığı
        doc.setDrawColor(220, 220, 220);
        doc.rect(15, yPos, pageWidth - 30, 8, 'S');
        
        // Başlık metni
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(baslik, 20, yPos + 5.5);
        
        // Değer metni
        doc.setFont("helvetica", "normal");
        doc.text(deger, pageWidth - 25, yPos + 5.5, { align: 'right' });
        
        // DOT için açıklama ekle
        if (baslik === 'DOT:') {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text("(Üretim Yili+Hafta)", pageWidth - 60, yPos + 5.5, { align: 'right' });
        }
        
        yPos += 8;
      }
      
      yPos += 15;
      
      // Özet kutuları arka planları açık gri ve içeriklerini temizleyen yeni fonksiyon
      const drawSummaryBox = (title: string, value: string, x: number, valueColor: [number, number, number], extraInfo?: string) => {
        // Kutu arkaplanı ve kenarlığı
        doc.setFillColor(245, 245, 245);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(x, yPos, 60, 35, 3, 3, 'FD');
        
        // Kutu içindeki metinleri temizle (beyaz dikdörtgen)
        doc.setFillColor(245, 245, 245);
        doc.rect(x + 2, yPos + 2, 56, 31, 'F');
        
        // Başlık
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, x + 30, yPos + 10, { align: 'center' });
        
        // Değer
        doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
        doc.setFontSize(16);
        doc.text(value, x + 30, yPos + 25, { align: 'center' });
        
        // Ek bilgi
        if (extraInfo) {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(extraInfo, x + 30, yPos + 32, { align: 'center' });
        }
      };
      
      // Genel Durum kutusu yerine Görsel Durum kutusu
      const durumText = fixTurkishChars(analizSonuclari.genelDurum);
      const isIyi = durumText.toUpperCase() === 'IYI' || durumText.toUpperCase() === 'İYI';
      
      // Görsel durum yüzdeliği hesaplama - duruma göre bir yüzde değeri oluştur
      const gorselDurumYuzdesi = isIyi ? 90 : analizSonuclari.guvenlikSkoru >= 75 ? 80 : 
                                 analizSonuclari.guvenlikSkoru >= 50 ? 60 : 
                                 analizSonuclari.guvenlikSkoru >= 30 ? 40 : 20;
      
      // Görsel durumun seviyesini belirle
      const gorselDurumSeviye = gorselDurumYuzdesi >= 75 ? 'Iyi' : 
                               gorselDurumYuzdesi >= 50 ? 'Orta' : 'Kotu';
      
      drawSummaryBox(
        'Gorsel Durum', 
        `%${gorselDurumYuzdesi}`, 
        10, 
        [
          gorselDurumYuzdesi >= 75 ? 0 : gorselDurumYuzdesi >= 50 ? 255 : 200, 
          gorselDurumYuzdesi >= 75 ? 150 : gorselDurumYuzdesi >= 50 ? 165 : 0, 
          0
        ],
        `${gorselDurumSeviye} seviye`
      );
      
      // Güvenlik Skoru kutusu
      const skor = analizSonuclari.guvenlikSkoru;
      let skorRenk: [number, number, number];
      if (skor >= 75) {
        skorRenk = [0, 150, 0]; // Yeşil
      } else if (skor >= 50) {
        skorRenk = [255, 165, 0]; // Turuncu
      } else {
        skorRenk = [200, 0, 0]; // Kırmızı
      }
      
      // Güvenlik skoru açıklaması
      let skorAciklama = "Düşük";
      if (skor >= 75) skorAciklama = "Yüksek";
      else if (skor >= 50) skorAciklama = "Orta";
      
      drawSummaryBox('Guvenlik Skoru', `${skor}%`, 75, skorRenk, `Seviye: ${fixTurkishChars(skorAciklama)}`);
      
      // Tahmini Ömür hesaplama
      const omurText = fixTurkishChars(analizSonuclari.tahminiOmur);
      
      // Ay bilgisini ayıklama
      const ayMatch = omurText.match(/(\d+)\s*ay/i);
      const ayDegeri = ayMatch ? parseInt(ayMatch[1]) : 0;
      
      // Yüzde hesaplama - ortalama lastik ömrü 4 yıl (48 ay) kabul edildi
      const omurYuzdesi = Math.min(100, Math.round((ayDegeri / 48) * 100));
      
      // Tahmini ömür seviyesini belirle
      const omurSeviye = omurYuzdesi >= 75 ? 'Uzun' : 
                        omurYuzdesi >= 50 ? 'Orta' : 
                        omurYuzdesi >= 25 ? 'Kisa' : 'Cok kisa';
      
      // Ömür rengi belirleme
      const omurRenk: [number, number, number] = 
        omurYuzdesi >= 75 ? [0, 150, 0] : // Yeşil
        omurYuzdesi >= 50 ? [0, 0, 200] : // Mavi
        omurYuzdesi >= 25 ? [255, 165, 0] : // Turuncu
        [200, 0, 0]; // Kırmızı
      
      // Tahmini Ömür kutusu
      drawSummaryBox('Tahmini Omur', omurText, 140, omurRenk, `Kalan: ${omurYuzdesi}% (${omurSeviye})`);
      
      yPos += 50;
      
      // Analiz sonuçları tablosu
      // İçerik çok fazlaysa yeni sayfaya geç
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 40;
      }
      
      const analizVerileri = [
        ['Dis Derinligi', `${analizSonuclari.disDerinligi} mm`],
        ['Yanak Durumu', fixTurkishChars(analizSonuclari.yanakDurumu)],
        ['Asinma Orani', `%${analizSonuclari.asinmaOrani}`]
      ];
      
      // Analiz sonuçları başlığı
      doc.setFillColor(24, 59, 86);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text('ANALIZ SONUCLARI', pageWidth/2, yPos + 6.5, { align: 'center' });
      
      yPos += 15;
      
      // Analiz sonuçları içeriği - manuel tablo çizim
      for (let i = 0; i < analizVerileri.length; i++) {
        const [baslik, deger] = analizVerileri[i];
        
        // Satır arkaplanı
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        
        // Satır kenarlığı
        doc.setDrawColor(220, 220, 220);
        doc.rect(15, yPos, pageWidth - 30, 10, 'S');
        
        // Başlık metni
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(baslik, 20, yPos + 6.5);
        
        // Değer metni
        doc.setFont("helvetica", "normal");
        doc.text(deger, pageWidth - 25, yPos + 6.5, { align: 'right' });
        
        // Aşınma oranı için yüzde renklendirmesi ve açıklama
        if (baslik === 'Asinma Orani') {
          const asinmaOrani = analizSonuclari.asinmaOrani;
          const asinmaRenk = asinmaOrani > 70 ? 'Kirmizi' : asinmaOrani > 40 ? 'Turuncu' : 'Yesil';
          const renk = asinmaRenk === 'Kirmizi' ? 'Yuksek' : asinmaRenk === 'Turuncu' ? 'Orta' : 'Dusuk';
          
          doc.setFontSize(8);
          doc.setTextColor(asinmaRenk === 'Kirmizi' ? 200 : asinmaRenk === 'Turuncu' ? 255 : 0, 
                          asinmaRenk === 'Yesil' ? 150 : asinmaRenk === 'Turuncu' ? 165 : 0,
                          0);
          doc.text(`${renk} seviye`, pageWidth - 60, yPos + 6.5, { align: 'right' });
        }
        
        // Diş derinliği için bilgi
        if (baslik === 'Dis Derinligi') {
          const disDerinligi = analizSonuclari.disDerinligi;
          const disRenk = disDerinligi < 3 ? 'Kirmizi' : disDerinligi < 5 ? 'Turuncu' : 'Yesil';
          const mesaj = disDerinligi < 3 ? 'Kritik seviye' : disDerinligi < 5 ? 'Normal' : 'Iyi durum';
          
          doc.setFontSize(8);
          doc.setTextColor(disRenk === 'Kirmizi' ? 200 : disRenk === 'Turuncu' ? 255 : 0, 
                           disRenk === 'Yesil' ? 150 : disRenk === 'Turuncu' ? 165 : 0,
                           0);
          doc.text(mesaj, pageWidth - 60, yPos + 6.5, { align: 'right' });
        }
        
        yPos += 10;
      }
      
      // Önerilen Bakımlar tablosu
      if (onerilenBakimlar && onerilenBakimlar.length > 0) {
        // İçerik çok fazlaysa yeni sayfaya geç
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 40;
        }
        
        const temizOnerilenBakimlar = onerilenBakimlar.map(bakim => 
          fixTurkishChars(bakim)
        );
        
        // Önerilen bakımlar başlığı
        doc.setFillColor(24, 59, 86);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('ONERILEN BAKIMLAR', pageWidth/2, yPos + 6.5, { align: 'center' });
        
        yPos += 15;
        
        // Önerilen bakımlar içeriği - manuel tablo çizim
        for (let i = 0; i < temizOnerilenBakimlar.length; i++) {
          const bakim = temizOnerilenBakimlar[i];
          
          // Satır yüksekliğini arttır
          const rowHeight = 10; // 8'den 10'a çıkarıldı
          
          // Kalan alan yeterli değilse yeni sayfaya geç
          if (yPos + rowHeight > pageHeight - 30) {
            doc.addPage();
            yPos = 40;
            
            // Yeni sayfada başlığı tekrarla
            doc.setFillColor(24, 59, 86);
            doc.rect(15, yPos, pageWidth - 30, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text('ONERILEN BAKIMLAR (DEVAM)', pageWidth/2, yPos + 6.5, { align: 'center' });
            
            yPos += 15;
          }
          
          // Satır arkaplanı
          doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255);
          doc.rect(15, yPos, pageWidth - 30, rowHeight, 'F');
          
          // Satır kenarlığı
          doc.setDrawColor(220, 220, 220);
          doc.rect(15, yPos, pageWidth - 30, rowHeight, 'S');
          
          // Bakım metni
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(bakim, 20, yPos + (rowHeight/2) + 1); // Dikey hizalamayı düzelt
          
          yPos += rowHeight;
        }
        
        yPos += 15; // Sayfanın sonunda daha fazla boşluk bırak
      }
      
      // Tespit Edilen Sorunlar tablosu
      if (sorunlar && sorunlar.length > 0) {
        // İçerik çok fazlaysa yeni sayfaya geç
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 40;
        }
        
        const temizSorunlar = sorunlar.map(sorun => 
          fixTurkishChars(sorun)
        );
        
        // Tespit edilen sorunlar başlığı
        doc.setFillColor(24, 59, 86);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('TESPIT EDILEN SORUNLAR', pageWidth/2, yPos + 6.5, { align: 'center' });
        
        yPos += 15;
        
        // Tespit edilen sorunlar içeriği - manuel tablo çizim
        for (let i = 0; i < temizSorunlar.length; i++) {
          const sorun = temizSorunlar[i];
          
          // Satır yüksekliğini arttır
          const rowHeight = 10; // 8'den 10'a çıkarıldı
          
          // Kalan alan yeterli değilse yeni sayfaya geç
          if (yPos + rowHeight > pageHeight - 30) {
            doc.addPage();
            yPos = 40;
            
            // Yeni sayfada başlığı tekrarla
            doc.setFillColor(24, 59, 86);
            doc.rect(15, yPos, pageWidth - 30, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text('TESPIT EDILEN SORUNLAR (DEVAM)', pageWidth/2, yPos + 6.5, { align: 'center' });
            
            yPos += 15;
          }
          
          // Satır arkaplanı
          doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 248 : 255);
          doc.rect(15, yPos, pageWidth - 30, rowHeight, 'F');
          
          // Satır kenarlığı
          doc.setDrawColor(220, 220, 220);
          doc.rect(15, yPos, pageWidth - 30, rowHeight, 'S');
          
          // Sorun metni
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(sorun, 20, yPos + (rowHeight/2) + 1); // Dikey hizalamayı düzelt
          
          yPos += rowHeight;
        }
        
        yPos += 15; // Sayfanın sonunda daha fazla boşluk bırak
      }
      
      // Alt bilgi satırı için her zaman yeterli boşluk olduğunu garantile
      if (yPos > pageHeight - 30) {
        doc.addPage();
      }
      
      // Alt bilgi satırı
      const footerStr = `LastikBende Analiz Raporu - ${tarih}`;
      let pageCount = 1;
      try {
        pageCount = doc.internal.pages.length;
      } catch (e) {
        // Sayfa sayısı alınamazsa varsayılan 1 sayfa olsun
        console.log('Sayfa sayısı alınamadı, varsayılan 1 kullanılacak');
      }
      
      // Tüm sayfalar için alt bilgi ekle
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Alt bilgi çizgisi - sayfanın en altından biraz yukarıda
        const footerY = pageHeight - 15;
        doc.setDrawColor(200, 200, 200);
        doc.line(10, footerY, pageWidth - 10, footerY);
        
        // Alt bilgi metni
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(footerStr, 10, footerY + 5);
        
        // Sayfa numarası
        doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth - 20, footerY + 5);
      }
      
      // PDF'i indir
      doc.save(`lastik-analiz-${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
      alert('PDF olusturulurken bir hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleExportPdf}
      disabled={loading}
      className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-xl transition-all duration-300 shadow-sm ${
        loading 
          ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30' 
          : 'bg-dark-300 hover:bg-dark-400 border border-gray-700/50 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]'
      }`}
    >
      <div className="flex flex-col items-center">
        {loading ? (
          <>
            <FaSpinner className="animate-spin text-2xl text-red-500 mb-2" />
            <span className="text-red-400 text-xs font-medium">İşleniyor</span>
          </>
        ) : (
          <>
            <FaFilePdf className="text-2xl text-red-500 mb-2 transition-transform duration-200" />
            <span className="text-gray-300 text-sm">PDF</span>
          </>
        )}
      </div>
    </motion.button>
  );
};

export default PdfExporter; 