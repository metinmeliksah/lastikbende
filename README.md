# LastikBende

LastikBende, lastik analizi ve yönetimi için geliştirilmiş modern bir web uygulamasıdır. Azure Computer Vision API kullanarak lastik görüntülerini analiz eder ve detaylı raporlar sunar.

## Özellikler

- 🖼️ Lastik görüntü analizi
- 📊 Detaylı analiz raporları
- 🌐 Çoklu dil desteği
- 📱 Responsive tasarım
- 🔒 Güvenli form validasyonu
- ⚡ Gerçek zamanlı analiz takibi

## Teknolojiler

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Azure Computer Vision API
- WebSocket
- i18n

## Başlangıç

### Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- Azure Computer Vision API anahtarı

### Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/your-username/lastikbende.git
cd lastikbende
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyasını oluşturun:
```env
AZURE_VISION_KEY=your_api_key
AZURE_VISION_ENDPOINT=your_endpoint
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Proje Yapısı

```
lastikbende/
├── app/                    # Next.js app router
│   ├── analiz/            # Lastik analiz sayfası
│   ├── i18n/              # i18n yapılandırması
│   ├── globals.css        # Global stiller
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Ana sayfa
├── components/            # React bileşenleri
│   ├── ui/               # UI bileşenleri
│   ├── forms/            # Form bileşenleri
│   └── layout/           # Layout bileşenleri
├── lib/                  # Yardımcı fonksiyonlar
├── public/              # Statik dosyalar
└── docs/               # Dokümantasyon
```

## Katkıda Bulunma

Katkıda bulunmak için [CONTRIBUTING.md](docs/CONTRIBUTING.md) dosyasını inceleyin.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## İletişim

- GitHub Issues: [Issues](https://github.com/your-username/lastikbende/issues)
- E-posta: your-email@example.com
