# LastikBende - Yapay Zeka Destekli Lastik Analiz Platformu

LastikBende, lastik analizi ve yönetimi için geliştirilmiş, Azure Computer Vision API ve yapay zeka teknolojilerini kullanan modern bir web uygulamasıdır. Platform, lastik durumunu analiz etme, raporlama ve uzman tavsiyeleri sunma özellikleriyle lastik güvenliğini ve performansını optimize etmeyi hedefler.

## 🚀 Özellikler

### 📸 Lastik Analizi
- Görüntü tabanlı lastik durumu değerlendirmesi
- Yapay zeka destekli sorun tespiti
- Güvenlik skoru ve kalan ömür hesaplaması
- Detaylı diş derinliği analizi
- Aşınma oranı tespiti

### 📊 Raporlama
- PDF, Excel ve Word formatlarında profesyonel raporlar
- Özelleştirilmiş tasarım ve görsel unsurlar
- Detaylı analiz çıktıları
- Bakım önerileri ve güvenlik tavsiyeleri

### 💬 Akıllı Lastik Uzmanı
- GPT-4o tabanlı lastik uzmanı asistanı
- Gerçek zamanlı mesajlaşma
- Analiz sonuçlarını otomatik değerlendirme
- Kişiselleştirilmiş bakım önerileri
- Markdown formatında zengin metin desteği

## 🛠️ Teknolojiler

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- React Query
- React Hook Form
- Zod

### Backend
- Next.js API Routes
- Azure Computer Vision API
- OpenAI GPT-4o
- PostgreSQL
- Redis Cache

### Araçlar ve Kütüphaneler
- Puppeteer (PDF oluşturma)
- ExcelJS (Excel raporlama)
- Docx (Word raporlama)
- Recharts (Grafikler)
- JSPDF (PDF işlemleri)

## 📁 Proje Yapısı

```
lastikbende/
├── app/                    # Next.js uygulama dizini
│   ├── analiz/            # Lastik analiz modülü
│   │   ├── api/           # API endpoint'leri
│   │   ├── components/    # UI bileşenleri
│   │   ├── services/      # Servis modülleri
│   │   ├── config/        # Yapılandırma
│   │   ├── lib/           # Yardımcı fonksiyonlar
│   │   └── translations/  # Çeviri dosyaları
│   ├── i18n/              # Uluslararasılaştırma
│   └── globals.css        # Global stiller
│
├── components/            # Genel UI bileşenleri
│   ├── Navbar.tsx        # Navigasyon çubuğu
│   ├── Footer.tsx        # Alt bilgi
│   ├── Hero.tsx          # Ana sayfa hero bölümü
│   ├── Services.tsx      # Hizmetler bölümü
│   ├── FeaturedProducts.tsx  # Öne çıkan ürünler
│   └── Categories.tsx    # Kategori listesi
│
├── docs/                 # Dokümantasyon
│   ├── diagrams/         # Sistem diyagramları
│   ├── ARCHITECTURE.md   # Mimari dokümantasyon
│   ├── DEPLOYMENT.md     # Deployment kılavuzu
│   ├── TESTING.md        # Test stratejisi
│   ├── SECURITY.md       # Güvenlik politikaları
│   └── CONTRIBUTING.md   # Katkıda bulunma rehberi
│
└── public/              # Statik dosyalar
```

## 🚀 Başlangıç

### **Gereksinimler**
  - Node.js 18+
  - npm veya yarn
  - Azure Computer Vision API anahtarı
  - OpenAI API anahtarı

- **Kurulum**
  ```bash
  # Repoyu klonlayın
  git clone https://github.com/your-username/lastikbende.git
  cd lastikbende

  # Bağımlılıkları yükleyin
  npm install

  # Geliştirme sunucusunu başlatın
  npm run dev
  ```

- **Çevre Değişkenleri**
  ```env
  AZURE_VISION_KEY=your_azure_vision_api_key
  AZURE_VISION_ENDPOINT=your_azure_vision_endpoint
  OPENAI_API_KEY=your_openai_api_key
  DATABASE_URL=your_database_url
  REDIS_URL=your_redis_url
  ```

## 📚 Dokümantasyon

Detaylı dokümantasyon için aşağıdaki dosyaları inceleyin:

- [Mimari Dokümantasyon](docs/ARCHITECTURE.md)
- [Deployment Kılavuzu](docs/DEPLOYMENT.md)
- [Test Stratejisi](docs/TESTING.md)
- [Güvenlik Politikaları](docs/SECURITY.md)
- [Katkıda Bulunma Rehberi](docs/CONTRIBUTING.md)

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 📞 İletişim

- Website: [lastikbende.com](https://lastikbende.com)
- Email: info@lastikbende.com
- Twitter: [@lastikbende](https://twitter.com/lastikbende)
- LinkedIn: [LastikBende](https://linkedin.com/company/lastikbende)
