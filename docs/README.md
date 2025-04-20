# LastikBende Dokümantasyonu

## Genel Bakış
LastikBende, lastik analizi ve değerlendirmesi yapan web tabanlı bir uygulamadır. Bu dokümantasyon, projenin teknik detaylarını, kurulum adımlarını ve kullanım kılavuzlarını içermektedir.

## Dokümantasyon İçeriği

### Temel Dokümanlar
- [Gereksinimler Analizi](./REQUIREMENTS.md) - Sistem gereksinimleri ve özellikleri
- [API Dokümantasyonu](./API.md) - API endpoint'leri ve kullanımı
- [Mimari Dokümantasyon](./ARCHITECTURE.md) - Sistem mimarisi ve bileşenleri

### Geliştirici Dokümanları
- [Katkıda Bulunma Kılavuzu](./CONTRIBUTING.md) - Geliştirme süreçleri ve standartları
- [Test Kılavuzu](./TESTING.md) - Test süreçleri ve standartları
- [Dağıtım Kılavuzu](./DEPLOYMENT.md) - Dağıtım ve deployment süreçleri

### Diğer Dokümanlar
- [Değişiklik Günlüğü](./CHANGELOG.md) - Versiyon geçmişi ve değişiklikler
- [Güvenlik Politikaları](./SECURITY.md) - Güvenlik standartları ve politikaları

## Hızlı Başlangıç

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Modern bir web tarayıcısı

### Kurulum
```bash
# Projeyi klonlayın
git clone https://github.com/your-username/lastikbende.git

# Proje dizinine gidin
cd lastikbende

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### Ortam Değişkenleri
Projeyi çalıştırmak için aşağıdaki ortam değişkenlerini `.env` dosyasında tanımlamanız gerekmektedir:

```env
NEXT_PUBLIC_API_URL=your_api_url
AZURE_VISION_KEY=your_azure_key
AZURE_VISION_ENDPOINT=your_azure_endpoint
```

## Katkıda Bulunma
Projeye katkıda bulunmak için lütfen [Katkıda Bulunma Kılavuzu](./CONTRIBUTING.md) dokümanını inceleyin.

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](../LICENSE) dosyasını inceleyebilirsiniz.

## İletişim
- Proje Yöneticisi: [İsim Soyisim]
- E-posta: [E-posta adresi]
- GitHub: [GitHub profili] 