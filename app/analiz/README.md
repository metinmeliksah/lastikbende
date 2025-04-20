# Lastik Analizi Modülü

Bu modül, LastikBende platformunun lastik analiz işlevselliğini sağlayan bileşenleri içermektedir. Yapay zeka destekli lastik analizi, çeşitli raporlama seçenekleri ve kullanıcı dostu arayüz bileşenlerini kapsar.

> 📚 **Detaylı Dokümantasyon**
> 
> Bu modül hakkında daha fazla bilgi için aşağıdaki belgelere göz atın:
> 
> - [Gereksinim Analizi](../docs/REQUIREMENTS.md) - Modülün tüm gereksinimleri ve özellikleri
> - [API Dokümantasyonu](../docs/API.md) - Tüm API endpoint'leri ve kullanımları
> - [Mimari Detaylar](../docs/ARCHITECTURE.md) - Sistem mimarisi ve bileşen ilişkileri
> - [Deployment Kılavuzu](../docs/DEPLOYMENT.md) - Kurulum ve dağıtım adımları
> - [Test Stratejisi](../docs/TESTING.md) - Test yaklaşımları ve senaryoları
> - [Güvenlik Politikaları](../docs/SECURITY.md) - Güvenlik önlemleri ve standartları
> - [Katkıda Bulunma Rehberi](../docs/CONTRIBUTING.md) - Geliştirme süreçleri ve kuralları
> 
> **Modül Bileşenleri:**
> - [Form Bileşenleri](#form-bileşenleri) - Analiz formu ve doğrulama
> - [Görüntü İşleme](#görüntü-işleme) - Lastik görüntü analizi
> - [Analiz Sistemi](#analiz-sistemi) - Yapay zeka analizi ve değerlendirme
> - [Raporlama](#raporlama) - PDF, Excel ve Word raporları
> - [Lastik Uzmanı Asistanı](#lastik-uzmanı-asistanı) - GPT-4o tabanlı uzman asistanı

## 🔍 Özellikler

- **Gelişmiş Lastik Analizi**
  - Görüntü tabanlı lastik durumu değerlendirmesi
  - Yapay zeka destekli sorun tespiti
  - Güvenlik skoru ve kalan ömür hesaplaması

- **Akıllı Rapor Oluşturma**
  - PDF, Excel ve Word formatlarında raporlar
  - Profesyonel ve detaylı analiz çıktıları 
  - Özelleştirilmiş tasarım ve görsel unsurlar

- **Akıllı Lastik Uzmanı Chat**
  - GPT-4o tabanlı lastik uzmanı asistanı
  - Gerçek zamanlı mesajlaşma ve yanıt alma
  - Analiz sonuçlarını otomatik değerlendirme
  - Markdown formatında zengin metin desteği
  - Animasyonlu yazma efektleri
  - 50 mesaja kadar sohbet geçmişi
  - Kişiselleştirilmiş bakım önerileri
  - Analiz raporlarını paylaşma ve yorumlama

## 📁 Dosya Yapısı

```
analiz/
├── api/              # API endpoint'leri
│   ├── analyze/      # Lastik analizi API
│   ├── export/       # Rapor oluşturma API'leri (PDF, Excel, Word)
│   ├── chat/         # Chat API endpoint'i
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
│   ├── TireExpertChat.tsx           # Lastik uzmanı chat bileşeni
│   ├── ChatWindow.tsx               # Chat penceresi UI
│   ├── ChatIcon.tsx                 # Chat simgesi
│   └── StatusTracker.tsx            # İşlem durum izleyicisi
│
├── services/         # Servis modülleri
│   ├── azure-vision.ts    # Azure Görüntü Tanıma servisi
│   ├── chatgpt.ts         # OpenAI GPT entegrasyonu
│   ├── chatService.ts     # Chat mesajlaşma servisi
│   ├── validationService.ts  # Form doğrulama servisi
│   └── reportService.ts   # Rapor oluşturma servisi
│
├── config/           # Yapılandırma dosyaları
│   └── api.ts        # API yapılandırması
│
├── lib/              # Yardımcı fonksiyonlar
│   └── cacheAdapter.ts    # Önbellekleme adaptörü
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

### 3. Chat API `/analiz/api/chat`

Lastik uzmanı chatbot ile iletişim sağlayan endpoint.

**İstek (POST):**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sistem talimatları"
    },
    {
      "role": "user",
      "content": "Kullanıcı mesajı"
    }
  ]
}
```

**Yanıt:**
```json
{
  "success": true,
  "message": "GPT-4o'nun yanıtı"
}
```

**Özellikler:**
- GPT-4o modeli kullanımı
- 1000 token limit
- 0.7 sıcaklık değeri
- Markdown formatında yanıtlar
- Hata yönetimi ve loglama

### 4. Doğrulama API `/analiz/api/validate`

Form alanlarını doğrular ve düzeltme önerileri sunar.

## 🤖 Chat Modülü Detayları

### Bileşenler

1. **TireExpertChat.tsx**
   - Ana chat bileşeni
   - Durum yönetimi
   - Mesaj gönderme/alma
   - Yazma animasyonları
   - Analiz paylaşımı

2. **ChatWindow.tsx**
   - Sohbet arayüzü
   - Mesaj listesi görünümü
   - Giriş alanı

3. **ChatIcon.tsx**
   - Kayan chat butonu
   - Açma/kapama kontrolü

### Özellikler

1. **Mesajlaşma**
   - Gerçek zamanlı iletişim
   - Maksimum 50 mesaj geçmişi
   - Otomatik kaydırma
   - Yazma göstergesi

2. **Analiz Entegrasyonu**
   - Analiz sonuçlarını paylaşma
   - Otomatik değerlendirme
   - Özelleştirilmiş öneriler
   - Güvenlik tavsiyeleri

3. **Kullanıcı Deneyimi**
   - Markdown desteği
   - Animasyonlu yazma efekti
   - Otomatik odaklanma
   - Duyarlı tasarım

4. **Sistem Mesajları**
   - Özelleştirilmiş uzman talimatları
   - Türkçe dil desteği
   - Profesyonel iletişim tonu
   - Bağlam duyarlı yanıtlar

### Kullanım

```typescript
import { TireExpertChat } from '../components/TireExpertChat';

// Chat bileşenini kullanma
<TireExpertChat
  analysisResults={results}
  formData={formData}
/>
```

### Performans İyileştirmeleri

- Mesaj geçmişi sınırlandırma
- Gereksiz yeniden render önleme
- Debounced scroll işlemleri
- Önbelleklenmiş API yanıtları

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