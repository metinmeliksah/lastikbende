import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

// Excel (XLSX) formatındaki raporları oluşturacak API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const analizVerileri = await request.json();
    
    // Yeni bir Excel çalışma kitabı oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LastikBende Analiz Sistemi';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'LastikBende API';
    
    // Metaveri ekle (ExcelJS tiplerini genel obje tipinde kullanarak)
    const properties = workbook.properties as any;
    properties.date1904 = false;
    properties.title = 'Lastik Analiz Raporu';
    properties.subject = 'Lastik durumu analiz raporu';
    properties.keywords = 'lastik,analiz,rapor,güvenlik,aşınma,durum';
    properties.category = 'Analiz Raporları';
    properties.company = 'LastikBende';
    
    // Renk sabitleri
    const COLORS = {
      PRIMARY: '9C27B0',
      SECONDARY: '3F51B5', 
      SUCCESS: '4CAF50',
      WARNING: 'FF9800',
      DANGER: 'F44336',
      INFO: '2196F3',
      LIGHT: 'ECEFF1',
      DARK: '263238',
      WHITE: 'FFFFFF',
      BLACK: '000000',
      GRAY: '9E9E9E',
      HEADER_BG: '673AB7',
      TITLE_BG: '7E57C2'
    };
    
    // Sayfalar oluştur
    const ozet = workbook.addWorksheet('Özet');
    const analizSheet = workbook.addWorksheet('Analiz Sonuçları');
    const oneriSheet = workbook.addWorksheet('Öneriler ve Önlemler');
    const sorunSheet = workbook.addWorksheet('Tespit Edilen Sorunlar');
    
    // Sayfa içeriğini oluşturma fonksiyonu
    const styleHeaderRow = (sheet: ExcelJS.Worksheet, row: number) => {
      sheet.getRow(row).font = { bold: true, size: 12, color: { argb: COLORS.WHITE }};
      sheet.getRow(row).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.HEADER_BG }
      };
      sheet.getRow(row).alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(row).height = 25;
    };
    
    const styleTitleRow = (sheet: ExcelJS.Worksheet, row: number) => {
      sheet.getRow(row).font = { bold: true, size: 14, color: { argb: COLORS.WHITE }};
      sheet.getRow(row).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.TITLE_BG }
      };
      sheet.getRow(row).alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.getRow(row).height = 30;
    };
    
    const addSectionTitle = (sheet: ExcelJS.Worksheet, title: string, color = COLORS.TITLE_BG) => {
      const rowIndex = sheet.rowCount + 1;
      const row = sheet.addRow([title]);
      row.height = 30;
      row.font = { bold: true, size: 14, color: { argb: COLORS.WHITE } };
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      };
      row.alignment = { horizontal: 'center' };
      sheet.mergeCells(`A${rowIndex}:Z${rowIndex}`);
      return rowIndex;
    };
    
    const addSpacerRow = (sheet: ExcelJS.Worksheet) => {
      const row = sheet.addRow(['']);
      row.height = 10;
    };
    
    // =========================
    // ÖZET SAYFASI
    // =========================
    ozet.columns = [
      { header: 'Özellik', key: 'ozellik', width: 25 },
      { header: 'Değer', key: 'deger', width: 40 }
    ];
    
    // Logo ve başlık
    ozet.getRow(1).height = 60;
    const titleRow = ozet.getRow(1);
    titleRow.getCell(1).value = 'LASTİKBENDE ANALİZ RAPORU';
    titleRow.getCell(1).font = { size: 24, bold: true, color: { argb: COLORS.PRIMARY } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    ozet.mergeCells('A1:B1');
    
    addSpacerRow(ozet);
    
    // Tarih bilgisi
    const tarih = new Date();
    const formatliTarih = tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const tarihRow = ozet.addRow(['Rapor Tarihi', formatliTarih]);
    tarihRow.getCell(2).alignment = { horizontal: 'left' };
    
    addSpacerRow(ozet);
    
    // Özet bilgileri
    addSectionTitle(ozet, 'ÖZET BİLGİLER', COLORS.SECONDARY);
    
    // Güvenlik skoru analizi
    const guvenlikSkoru = analizVerileri.analizSonuclari?.guvenlikSkoru || 0;
    
    const getSeverityLevel = (score: number) => {
      if (score >= 80) return { text: 'İyi', color: COLORS.SUCCESS };
      if (score >= 60) return { text: 'Orta', color: COLORS.WARNING };
      return { text: 'Kritik', color: COLORS.DANGER };
    };
    
    const guvenlikInfo = getSeverityLevel(guvenlikSkoru);
    
    // Genel durum
    const genelDurumRow = ozet.addRow(['Genel Durum', analizVerileri.analizSonuclari?.genelDurum || 'Değerlendirilmedi']);
    genelDurumRow.getCell(2).font = { bold: true, color: { argb: guvenlikInfo.color } };
    
    // Güvenlik skoru
    const guvenlikRow = ozet.addRow(['Güvenlik Skoru', `%${guvenlikSkoru} (${guvenlikInfo.text})`]);
    guvenlikRow.getCell(2).font = { bold: true, color: { argb: guvenlikInfo.color } };
    
    // Diş derinliği
    const disDerinligi = analizVerileri.analizSonuclari?.disDerinligi || 0;
    const disInfo = disDerinligi > 3 ? { text: 'Yeterli', color: COLORS.SUCCESS } : { text: 'Kritik', color: COLORS.DANGER };
    
    const disRow = ozet.addRow(['Diş Derinliği', `${disDerinligi} mm (${disInfo.text})`]);
    disRow.getCell(2).font = { color: { argb: disInfo.color } };
    
    // Aşınma oranı
    const asinmaOrani = analizVerileri.analizSonuclari?.asinmaOrani || 0;
    const asinmaInfo = getSeverityLevel(100 - asinmaOrani);  // Tersine çevrilmiş skala
    
    const asinmaRow = ozet.addRow(['Aşınma Oranı', `%${asinmaOrani} (${asinmaInfo.text})`]);
    asinmaRow.getCell(2).font = { color: { argb: asinmaInfo.color } };
    
    // Tahmini ömür
    const tahminiOmurKm = analizVerileri.tahminiBilgiler?.tahminiOmur?.km 
      ? analizVerileri.tahminiBilgiler.tahminiOmur.km.toLocaleString('tr-TR') 
      : '0';
    
    const tahminiOmurAy = analizVerileri.tahminiBilgiler?.tahminiOmur?.ay || '0';
    
    ozet.addRow(['Tahmini Kalan Ömür', `${tahminiOmurKm} km / ${tahminiOmurAy} ay`]);
    
    // Tespit edilen sorun sayısı
    const sorunSayisi = analizVerileri.tahminiBilgiler?.sorunlar?.length || 0;
    const sorunInfoRow = ozet.addRow(['Tespit Edilen Sorun Sayısı', sorunSayisi.toString()]);
    
    if (sorunSayisi > 0) {
      sorunInfoRow.getCell(2).font = { 
        color: { 
          argb: sorunSayisi > 3 ? COLORS.DANGER : 
                sorunSayisi > 1 ? COLORS.WARNING : COLORS.INFO 
        } 
      };
    }
    
    addSpacerRow(ozet);
    addSpacerRow(ozet);
    
    // Lastik bilgileri
    addSectionTitle(ozet, 'LASTİK BİLGİLERİ', COLORS.PRIMARY);
    
    ozet.addRow(['Marka', analizVerileri.lastikBilgileri?.marka || 'Belirtilmemiş']);
    ozet.addRow(['Model', analizVerileri.lastikBilgileri?.model || 'Belirtilmemiş']);
    ozet.addRow(['Boyut', analizVerileri.lastikBilgileri?.boyut || 'Belirtilmemiş']);
    ozet.addRow(['Üretim Yılı', analizVerileri.lastikBilgileri?.uretimYili || 'Belirtilmemiş']);
    
    // Kilometre değeri
    const kmValue = analizVerileri.lastikBilgileri?.kilometre 
      ? analizVerileri.lastikBilgileri.kilometre.toLocaleString('tr-TR') + ' km'
      : 'Belirtilmemiş';
    ozet.addRow(['Kilometre', kmValue]);
    
    addSpacerRow(ozet);
    
    // Önemli not
    const notRow = ozet.rowCount + 2;
    ozet.getRow(notRow).getCell(1).value = 'NOT: Bu rapor LastikBende analiz sistemi tarafından otomatik olarak oluşturulmuştur. Detaylı bilgi için Analiz Sonuçları ve Öneriler sayfalarını inceleyiniz.';
    ozet.getRow(notRow).getCell(1).font = { italic: true, color: { argb: COLORS.GRAY } };
    ozet.mergeCells(`A${notRow}:B${notRow}`);
    
    // =========================
    // ANALİZ SONUÇLARI SAYFASI
    // =========================
    analizSheet.columns = [
      { header: 'Bilgi Türü', key: 'bilgiTuru', width: 25 },
      { header: 'Değer', key: 'deger', width: 30 },
      { header: 'Durum', key: 'durum', width: 20 }
    ];
    
    // Başlık satırı formatı
    styleHeaderRow(analizSheet, 1);
    
    // Sayfa stilini ayarla
    analizSheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
    ];
    
    // Lastik bilgileri bölümü
    addSectionTitle(analizSheet, 'LASTİK BİLGİLERİ', COLORS.PRIMARY);
    
    // Lastik bilgilerini ekle
    analizSheet.addRow(['Marka', analizVerileri.lastikBilgileri?.marka || 'Belirtilmemiş', '']);
    analizSheet.addRow(['Model', analizVerileri.lastikBilgileri?.model || 'Belirtilmemiş', '']);
    analizSheet.addRow(['Boyut', analizVerileri.lastikBilgileri?.boyut || 'Belirtilmemiş', '']);
    analizSheet.addRow(['Üretim Yılı', analizVerileri.lastikBilgileri?.uretimYili || 'Belirtilmemiş', '']);
    
    // Kilometre değeri
    analizSheet.addRow(['Kilometre', kmValue, '']);
    
    addSpacerRow(analizSheet);
    
    // Analiz sonuçları bölümü
    addSectionTitle(analizSheet, 'ANALİZ SONUÇLARI', COLORS.SECONDARY);
    
    // Analiz sonuçlarını ekle
    analizSheet.addRow(['Genel Durum', analizVerileri.analizSonuclari?.genelDurum || 'Belirtilmemiş', guvenlikInfo.text]);
    const genelDurumRowSheet = analizSheet.lastRow;
    if (genelDurumRowSheet) {
      genelDurumRowSheet.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: guvenlikInfo.color }
      };
      genelDurumRowSheet.getCell(3).font = {
        color: { argb: 'FFFFFF' }
      };
    }
    
    // Güvenlik skoru
    const safetyRow = analizSheet.addRow(['Güvenlik Skoru', `%${guvenlikSkoru}`, guvenlikInfo.text]);
    if (safetyRow) {
      safetyRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: guvenlikInfo.color }
      };
      safetyRow.getCell(3).font = {
        color: { argb: 'FFFFFF' }
      };
    }
    
    // Diğer analiz sonuçları
    const disDerinligiRow = analizSheet.addRow(['Diş Derinliği', `${disDerinligi} mm`, disInfo.text]);
    if (disDerinligiRow) {
      disDerinligiRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: disInfo.color }
      };
      disDerinligiRow.getCell(3).font = {
        color: { argb: 'FFFFFF' }
      };
    }
    
    // Yanak durumu
    const yanakDurumu = analizVerileri.analizSonuclari?.yanakDurumu || 'Belirtilmemiş';
    const yanakInfo = yanakDurumu === 'Normal' ? 
      { text: 'İyi', color: COLORS.SUCCESS } : 
      { text: 'Kontrol Gerekli', color: COLORS.WARNING };
    
    const yanakRow = analizSheet.addRow(['Yanak Durumu', yanakDurumu, yanakInfo.text]);
    if (yanakRow) {
      yanakRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: yanakInfo.color }
      };
      yanakRow.getCell(3).font = {
        color: { argb: 'FFFFFF' }
      };
    }
    
    // Aşınma oranı
    const asinmaOranRow = analizSheet.addRow(['Aşınma Oranı', `%${asinmaOrani}`, asinmaInfo.text]);
    if (asinmaOranRow) {
      asinmaOranRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: asinmaInfo.color }
      };
      asinmaOranRow.getCell(3).font = {
        color: { argb: 'FFFFFF' }
      };
    }
    
    addSpacerRow(analizSheet);
    
    // Tahmini ömür bölümü
    addSectionTitle(analizSheet, 'TAHMİNİ ÖMÜR', COLORS.INFO);
    
    // Tahmini ömür bilgilerini ekle
    analizSheet.addRow(['Tahmini Kilometre', `${tahminiOmurKm} km`, '']);
    analizSheet.addRow(['Tahmini Süre', `${tahminiOmurAy} ay`, '']);
    
    // =========================
    // ÖNERİLER ve ÖNLEMLER SAYFASI
    // =========================
    oneriSheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: 'Önerilen Önlem', key: 'oneri', width: 60 },
      { header: 'Öncelik', key: 'oncelik', width: 15 }
    ];
    
    // Başlık satırı formatı
    styleHeaderRow(oneriSheet, 1);
    
    // Sayfa görünümünü ayarla
    oneriSheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
    ];
    
    // Başlık
    addSectionTitle(oneriSheet, 'ÖNERİLEN BAKIMLAR VE ÖNLEMLER', COLORS.PRIMARY);
    
    // Önerilen bakımları ekle
    if (analizVerileri.tahminiBilgiler?.onerilenBakimlar && 
        analizVerileri.tahminiBilgiler.onerilenBakimlar.length > 0) {
          
      analizVerileri.tahminiBilgiler.onerilenBakimlar.forEach((bakim: string, index: number) => {
        const oncelik = index < 2 ? 'Yüksek' : index < 4 ? 'Orta' : 'Düşük'; // Basit bir örnek
        const row = oneriSheet.addRow([index + 1, bakim, oncelik]);
        
        if (row) {
          // Önceliğe göre hücre rengini ayarla
          const oncelikColor = oncelik === 'Yüksek' ? COLORS.DANGER :
                              oncelik === 'Orta' ? COLORS.WARNING : COLORS.SUCCESS;
          
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: oncelikColor }
          };
          
          row.getCell(3).font = {
            color: { argb: oncelik === 'Yüksek' ? 'FFFFFF' : '000000' }
          };
          
          // Her ikinci satırın arka planını renklendir (okunurluğu artırmak için)
          if (index % 2 === 1) {
            for (let i = 1; i <= 2; i++) {
              row.getCell(i).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F5F5F5' }
              };
            }
          }
        }
      });
    } else {
      oneriSheet.addRow(['', 'Önerilen bakım bulunmamaktadır.', '']);
    }
    
    // Otomatik filtre ekle
    oneriSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: oneriSheet.rowCount, column: 3 }
    };
    
    // =========================
    // TESPİT EDİLEN SORUNLAR SAYFASI
    // =========================
    sorunSheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: 'Tür', key: 'tur', width: 20 },
      { header: 'Açıklama', key: 'aciklama', width: 50 },
      { header: 'Aciliyet', key: 'aciliyet', width: 15 }
    ];
    
    // Başlık satırı formatı
    styleHeaderRow(sorunSheet, 1);
    
    // Sayfa görünümünü ayarla
    sorunSheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
    ];
    
    // Başlık
    addSectionTitle(sorunSheet, 'TESPİT EDİLEN SORUNLAR', COLORS.DANGER);
    
    // Tespit edilen sorunları ekle
    if (analizVerileri.tahminiBilgiler?.sorunlar && 
        analizVerileri.tahminiBilgiler.sorunlar.length > 0) {
          
      analizVerileri.tahminiBilgiler.sorunlar.forEach((sorun: any, index: number) => {
        const sorunAciklamasi = sorun.description || 'Tanımlanmamış sorun';
        const sorunTipi = sorun.type || 'Genel';
        const sorunAciliyet = sorun.severity === 'high' ? 'Yüksek' : 
                            sorun.severity === 'medium' ? 'Orta' : 'Düşük';
        const aciliyetColor = sorun.severity === 'high' ? COLORS.DANGER :
                            sorun.severity === 'medium' ? COLORS.WARNING : COLORS.SUCCESS;
                      
        const row = sorunSheet.addRow([index + 1, sorunTipi, sorunAciklamasi, sorunAciliyet]);
        
        if (row) {
          // Aciliyete göre hücre rengini ayarla
          row.getCell(4).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: aciliyetColor }
          };
          
          row.getCell(4).font = {
            color: { argb: sorunAciliyet === 'Yüksek' ? 'FFFFFF' : '000000' }
          };
          
          // Her ikinci satırın arka planını renklendir (okunurluğu artırmak için)
          if (index % 2 === 1) {
            for (let i = 1; i <= 3; i++) {
              row.getCell(i).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F5F5F5' }
              };
            }
          }
        }
      });
    } else {
      sorunSheet.addRow(['', '', 'Herhangi bir sorun tespit edilmemiştir.', '']);
    }
    
    // Otomatik filtre ekle
    sorunSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: sorunSheet.rowCount, column: 4 }
    };
    
    // Excel dosyasını bir buffer'a yazma
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Excel dosyasını yanıt olarak döndür
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=lastik-analiz-${Date.now()}.xlsx`
      }
    });
    
  } catch (error: any) {
    console.error('Excel dokümanı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Excel dokümanı oluşturulurken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 