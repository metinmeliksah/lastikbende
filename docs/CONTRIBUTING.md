# Katkıda Bulunma Rehberi

Bu projeye katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye katkıda bulunma sürecini açıklar.

## Geliştirme Ortamı Kurulumu

1. Repoyu klonlayın:
```bash
git clone https://github.com/your-username/lastikbende.git
cd lastikbende
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
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

## Kod Standartları

- TypeScript kullanın
- ESLint kurallarına uyun
- Prettier ile kod formatını koruyun
- Component'leri functional component olarak yazın
- Props için TypeScript interface'leri kullanın
- Tailwind CSS class'larını düzenli kullanın

## Commit Mesajları

Commit mesajlarınızı aşağıdaki formatta yazın:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Tipler:
- feat: Yeni özellik
- fix: Hata düzeltmesi
- docs: Dokümantasyon değişiklikleri
- style: Kod formatı değişiklikleri
- refactor: Kod yeniden düzenleme
- test: Test ekleme veya düzenleme
- chore: Genel bakım

## Pull Request Süreci

1. Yeni bir branch oluşturun:
```bash
git checkout -b feature/your-feature-name
```

2. Değişikliklerinizi commit'leyin:
```bash
git commit -m "feat: add new feature"
```

3. Branch'inizi push'layın:
```bash
git push origin feature/your-feature-name
```

4. Pull Request oluşturun

5. Code review bekleyin

## Test

- Yeni özellikler için test yazın
- Mevcut testleri güncelleyin
- Test coverage'ı koruyun

## Dokümantasyon

- Yeni özellikler için dokümantasyon ekleyin
- API değişikliklerini belgelendirin
- README.md dosyasını güncel tutun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Katkıda bulunarak, katkılarınızın aynı lisans altında yayınlanmasını kabul etmiş olursunuz. 