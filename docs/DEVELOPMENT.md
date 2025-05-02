# Geliştirme Ortamı Kurulumu

## Gereksinimler

- Node.js (v18.0.0 veya üzeri)
- npm (v9.0.0 veya üzeri)
- Git
- PostgreSQL (v14 veya üzeri)
- Redis (v6 veya üzeri)
- Azure Computer Vision API hesabı
- OpenAI API hesabı

## Kurulum Adımları

### 1. Projeyi Klonlama

```bash
git clone https://github.com/your-org/lastikbende.git
cd lastikbende
```

### 2. Bağımlılıkların Yüklenmesi

```bash
npm install
```

### 3. Çevre Değişkenlerinin Ayarlanması

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lastikbende"

# Redis
REDIS_URL="redis://localhost:6379"

# Azure Computer Vision
AZURE_VISION_KEY="your-azure-vision-key"
AZURE_VISION_ENDPOINT="your-azure-vision-endpoint"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# Storage
STORAGE_BUCKET="your-storage-bucket"
STORAGE_REGION="your-storage-region"
```

### 4. Veritabanı Kurulumu

```bash
# PostgreSQL veritabanını oluştur
createdb lastikbende

# Migrasyonları çalıştır
npm run db:migrate

# Seed verilerini yükle (opsiyonel)
npm run db:seed
```

### 5. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışmaya başlayacaktır.

## Geliştirme İpuçları

### Kod Stili

- ESLint ve Prettier kullanıyoruz
- Commit öncesi kod kontrolü için:
  ```bash
  npm run lint
  npm run format
  ```

### Test

```bash
# Tüm testleri çalıştır
npm run test

# Belirli bir test dosyasını çalıştır
npm run test:file -- path/to/test/file

# Test coverage raporu
npm run test:coverage
```

### Veritabanı İşlemleri

```bash
# Yeni migrasyon oluştur
npm run db:migration:create -- name_of_migration

# Migrasyonları geri al
npm run db:rollback

# Veritabanını sıfırla
npm run db:reset
```

### API Geliştirme

- API endpoint'leri `app/api` dizininde bulunur
- Her endpoint için test yazılmalıdır
- Swagger dokümantasyonu güncel tutulmalıdır

### Frontend Geliştirme

- Bileşenler `components` dizininde bulunur
- Sayfa bileşenleri `app` dizininde bulunur
- Stil için Tailwind CSS kullanılıyor
- i18n için `public/locales` dizinini kullanın

## Yaygın Sorunlar ve Çözümleri

### Node.js Sürüm Uyumsuzluğu

```bash
# Node.js sürümünü kontrol et
node -v

# nvm kullanarak doğru sürüme geç
nvm use 18
```

### Veritabanı Bağlantı Hatası

1. PostgreSQL servisinin çalıştığından emin olun
2. Veritabanı kullanıcı izinlerini kontrol edin
3. `.env` dosyasındaki bağlantı bilgilerini doğrulayın

### API Anahtarı Hataları

1. Azure ve OpenAI API anahtarlarının doğru olduğunu kontrol edin
2. API kotalarını ve limitlerini kontrol edin
3. API endpoint'lerinin erişilebilir olduğunu doğrulayın

## Faydalı Komutlar

```bash
# Bağımlılıkları güncelle
npm update

# Önbelleği temizle
npm cache clean --force

# Build oluştur
npm run build

# Production modunda çalıştır
npm run start

# Docker container'larını başlat
docker-compose up -d
```

## IDE Ayarları

### VS Code Önerilen Eklentiler

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL
- GitLens
- Docker

### VS Code Ayarları

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Git Workflow

1. Feature branch oluştur
   ```bash
   git checkout -b feature/yeni-ozellik
   ```

2. Değişiklikleri commit et
   ```bash
   git add .
   git commit -m "feat: yeni özellik eklendi"
   ```

3. Main branch'e merge et
   ```bash
   git checkout main
   git merge feature/yeni-ozellik
   ```

## Deployment

Detaylı deployment talimatları için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasını inceleyin. 