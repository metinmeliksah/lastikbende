# Lastik Analizi Modülü

Bu modül, LastikBende platformunun lastik analiz işlevselliğini sağlayan bileşenleri içermektedir. Yapay zeka destekli lastik analizi, çeşitli raporlama seçenekleri ve kullanıcı dostu arayüz bileşenlerini kapsar.

## 🔍 Özellikler

- **Gelişmiş Lastik Analizi**
  - Görüntü tabanlı lastik durumu değerlendirmesi
  - Yapay zeka destekli sorun tespiti
  - Güvenlik skoru ve kalan ömür hesaplaması

- **Akıllı Rapor Oluşturma**
  - PDF, Excel ve Word formatlarında raporlar
  - Profesyonel ve detaylı analiz çıktıları 
  - Özelleştirilmiş tasarım ve görsel unsurlar

- **Uzman Asistan(Yaplılacak)**
  - GPT-4o tabanlı lastik uzmanı asistanı
  - Kişiselleştirilmiş öneri ve tavsiyeler
  - Analiz sonuçlarını açıklama yeteneği

## 📁 Dosya Yapısı

```
analiz/
├── api/              # API endpoint'leri
│   ├── analyze/      # Lastik analizi API
│   ├── export/       # Rapor oluşturma API'leri (PDF, Excel, Word)
│   └── validate/     # Form doğrulama API'si
│
├── components/       # UI bileşenleri
│   ├── FormSection.tsx              # Analiz formu
│   ├── ImageUploadSection.tsx       # Resim yükleme alanı
│   ├── AnalysisResultsSection.tsx   # Analiz sonuçları ana bileşeni
│   ├── AiAnalysisSection.tsx        # AI analiz paneli
│   ├── GuvenlikDegerlendirmesiSection.tsx  # Güvenlik değerlendirmesi
│   ├── TahminiOmurSection.tsx       # Tahmini ömür gösterimi
│   ├── BakimIhtiyaclariSection.tsx  # Bakım ihtiyaçları listesi
│   ├── SorunlarSection.tsx          # Tespit edilen sorunlar listesi
│   ├── ExportAnalysisSection.tsx    # Rapor oluşturma bölümü
│   ├── PdfExporter.tsx              # PDF ihraç bileşeni
│   └── StatusTracker.tsx            # İşlem durum izleyicisi
│
├── services/         # Servis modülleri
│   ├── azure-vision.ts    # Azure Görüntü Tanıma servisi
│   ├── chatgpt.ts         # OpenAI GPT entegrasyonu
│   ├── validationService.ts  # Form doğrulama servisi
│   └── chatService.ts     # Mesajlaşma servisi
│
├── config/           # Yapılandırma dosyaları
│   └── api.ts        # API yapılandırması
│
├── lib/              # Yardımcı fonksiyonlar
│
├── translations/     # Çeviri dosyaları
│
├── types.ts          # Tip tanımlamaları
│
├── styles.css        # CSS stil tanımları
│
└── page.tsx          # Ana sayfa bileşeni
```

## 🚀 Teknolojiler

Bu modülde aşağıdaki teknolojiler kullanılmaktadır:

- **Backend**
  - Next.js API Routes
  - Azure Computer Vision API
  - OpenAI GPT-4o
  - Puppeteer (PDF oluşturma)
  - ExcelJS (Excel raporlama)
  - Docx (Word raporlama)

- **Frontend**
  - React
  - TailwindCSS
  - Framer Motion
  - TypeScript

## 📝 API Endpointleri

### 1. Analiz API `/analiz/api/analyze`

Lastik görüntüsünü ve form verilerini işleyerek detaylı analiz sonuçları üretir.

**Parametreler:**
- `imageUrl`: Analiz edilecek lastik görüntüsünün URL'si
- `formData`: Lastik bilgilerini içeren form verileri
- `detectOnly`: Sadece görüntü analizi yapılıp yapılmayacağını belirten bayrak

**Yanıt:**
- Lastik durumu, güvenlik skoru, diş derinliği, aşınma oranı vb. detaylı analiz verileri

### 2. Export API'leri

#### PDF Raporu `/analiz/api/export/pdf`

Analiz sonuçlarından profesyonel PDF raporu oluşturur.

#### Excel Raporu `/analiz/api/export/excel`

Analiz verilerini detaylı çalışma sayfalarıyla Excel formatında sunar.

#### Word Raporu `/analiz/api/export/word`

Lastik analiz verilerinden zengin metin içerikli Word raporu üretir.

### 3. Doğrulama API `/analiz/api/validate`

Form alanlarını doğrular ve düzeltme önerileri sunar.

## 🧰 Kurulum ve Kullanım

1. Gerekli çevre değişkenlerini ayarlayın:
   ```
   AZURE_VISION_KEY=your_azure_vision_api_key
   AZURE_VISION_ENDPOINT=your_azure_vision_endpoint
   OPENAI_API_KEY=your_openai_api_key
   ```

2. Modülün kullanımı:
   ```javascript
   import AnalysisPage from '../app/analiz/page';
   
   // Analiz sayfasını kullanmak için bileşeni çağırın
   <AnalysisPage />
   ```

## 🧪 Geliştirme

Yeni özellikler eklemek için:

1. Uygun klasöre yeni bileşen veya servis dosyasını ekleyin
2. Tipleri `types.ts` dosyasında tanımlayın
3. Gerekirse yeni API endpoint'leri oluşturun
4. `page.tsx` dosyasında yeni bileşeni entegre edin

## 📊 Performans İpuçları

- Büyük görüntüler yüklemeden önce optimize edin
- API isteklerinde önbellek kullanımına dikkat edin
- Rapor oluşturma işlemlerini asenkron olarak gerçekleştirin

## 🤝 Katkıda Bulunma

Lastik analiz modülünü geliştirmek için:

1. Yeni özellik önerilerinizi issue olarak açın
2. Mevcut kodda iyileştirmeler yapın
3. Test kapsamını artırın

## 📜 Lisans

Bu modül, LastikBende projesinin bir parçasıdır ve MIT lisansı altında dağıtılmaktadır. 