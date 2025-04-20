# LastikBende Dokümantasyonu

## Genel Bakış
LastikBende, yapay zeka destekli lastik analizi ve online lastik satışı yapan kapsamlı bir e-ticaret platformudur. Bu dokümantasyon, projenin teknik detaylarını, kurulum adımlarını ve kullanım kılavuzlarını içermektedir.

## Dokümantasyon İçeriği

### Temel Dokümanlar
- [Gereksinimler Analizi](./REQUIREMENTS.md) - Sistem gereksinimleri ve özellikleri
- [API Dokümantasyonu](./API.md) - API endpoint'leri ve kullanımı
- [Mimari Dokümantasyon](./ARCHITECTURE.md) - Sistem mimarisi ve bileşenleri
- [E-Ticaret Modülü](./ECOMMERCE.md) - E-ticaret sistemi ve özellikleri

### Geliştirici Dokümanları
- [Katkıda Bulunma Kılavuzu](./CONTRIBUTING.md) - Geliştirme süreçleri ve standartları
- [Test Kılavuzu](./TESTING.md) - Test süreçleri ve standartları
- [Dağıtım Kılavuzu](./DEPLOYMENT.md) - Dağıtım ve deployment süreçleri

### Diğer Dokümanlar
- [Değişiklik Günlüğü](./CHANGELOG.md) - Versiyon geçmişi ve değişiklikler
- [Güvenlik Politikaları](./SECURITY.md) - Güvenlik standartları ve politikaları

## Ana Özellikler

### 🔍 Lastik Analizi
- Yapay zeka destekli görüntü analizi
- Detaylı lastik durum raporu
- Güvenlik değerlendirmesi
- Bakım önerileri

### 🛒 E-Ticaret
- Geniş lastik kataloğu
- Akıllı lastik seçim asistanı
- Güvenli ödeme sistemi
- Kargo takibi

### 💬 Lastik Uzmanı Chat
- GPT-4o destekli akıllı asistan
- Kişiselleştirilmiş öneriler
- 7/24 destek

## Hızlı Başlangıç

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- PostgreSQL
- Redis
- Modern bir web tarayıcısı

### Kurulum
```bash
# Projeyi klonlayın
git clone https://github.com/your-username/lastikbende.git

# Proje dizinine gidin
cd lastikbende

# Bağımlılıkları yükleyin
npm install

# Veritabanını oluşturun
npm run db:setup

# Geliştirme sunucusunu başlatın
npm run dev
```

### Ortam Değişkenleri
Projeyi çalıştırmak için aşağıdaki ortam değişkenlerini `.env` dosyasında tanımlamanız gerekmektedir:

```env
# API ve Uygulama
NEXT_PUBLIC_API_URL=your_api_url
AZURE_VISION_KEY=your_azure_key
AZURE_VISION_ENDPOINT=your_azure_endpoint
OPENAI_API_KEY=your_openai_key

# Veritabanı
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# Ödeme Sistemleri
IYZICO_API_KEY=your_iyzico_key
IYZICO_SECRET_KEY=your_iyzico_secret
```

## Katkıda Bulunma
Projeye katkıda bulunmak için lütfen [Katkıda Bulunma Kılavuzu](./CONTRIBUTING.md) dokümanını inceleyin.

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](../LICENSE) dosyasını inceleyebilirsiniz.

## İletişim
- Website: [lastikbende.com](https://lastikbende.com)
- E-posta: info@lastikbende.com
- Twitter: [@lastikbende](https://twitter.com/lastikbende)
- LinkedIn: [LastikBende](https://linkedin.com/company/lastikbende) 