# Dağıtım Kılavuzu

## Genel Bakış

Bu doküman, LastikBende uygulamasının dağıtım süreçlerini ve gereksinimlerini açıklamaktadır.

> Detaylı deployment diyagramı için [Deployment Diagram](diagrams/deployment.md) dosyasını inceleyin.

## Gereksinimler

### Sunucu Gereksinimleri
- Node.js v18 veya üzeri
- npm veya yarn
- Git
- PM2 (process manager)
- Nginx
- SSL sertifikası

### Ortam Değişkenleri

`.env.production` dosyasında aşağıdaki değişkenleri tanımlayın:

```env
# Uygulama
NODE_ENV=production
PORT=3000

# API
NEXT_PUBLIC_API_URL=https://api.lastikbende.com
NEXT_PUBLIC_WS_URL=wss://api.lastikbende.com
AZURE_VISION_KEY=your_api_key
AZURE_VISION_ENDPOINT=your_endpoint

# Veritabanı
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Redis
REDIS_URL=your_redis_url

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Dağıtım Adımları

### 1. Sunucu Hazırlığı
```bash
# Sistem güncellemesi
sudo apt update
sudo apt upgrade

# Gerekli paketlerin kurulumu
sudo apt install nodejs npm git nginx

# PM2 kurulumu
npm install -g pm2
```

### 2. Uygulama Kurulumu
```bash
# Projeyi klonla
git clone https://github.com/your-username/lastikbende.git
cd lastikbende

# Bağımlılıkları yükle
npm install

# Production build
npm run build
```

### 3. Nginx Yapılandırması
```nginx
server {
    listen 80;
    server_name lastikbende.com www.lastikbende.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Sertifikası
```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d lastikbende.com -d www.lastikbende.com
```

### 5. PM2 Yapılandırması
```bash
# PM2 ecosystem dosyası oluştur
pm2 ecosystem

# Uygulamayı başlat
pm2 start ecosystem.config.js --env production
```

### 6. Production Build

```bash
# Bağımlılıkları yükle
npm install

# Production build
npm run build

# Production sunucusunu başlat
npm start
```

### 7. Azure Deployment

#### Azure App Service

1. Azure Portal'da yeni bir App Service oluşturun
2. Deployment Center'ı yapılandırın
3. GitHub Actions workflow'unu etkinleştirin
4. Ortam değişkenlerini ayarlayın

#### Azure Container Registry

1. Container Registry oluşturun
2. Docker image'ı build edin:
```bash
docker build -t lastikbende .
```

3. Image'ı push edin:
```bash
docker push lastikbende.azurecr.io/lastikbende:latest
```

### 8. CI/CD Pipeline

GitHub Actions workflow örneği:

```yaml
name: Deploy to Azure
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'lastikbende'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

## Dağıtım Senaryoları

### 1. İlk Dağıtım
```bash
# Sunucu hazırlığı
./scripts/setup-server.sh

# Uygulama kurulumu
./scripts/deploy.sh

# SSL sertifikası
./scripts/setup-ssl.sh

# PM2 başlatma
./scripts/start-app.sh
```

### 2. Güncelleme
```bash
# Değişiklikleri çek
git pull origin main

# Bağımlılıkları güncelle
npm install

# Yeni build
npm run build

# Uygulamayı yeniden başlat
pm2 restart lastikbende
```

### 3. Rollback
```bash
# Önceki versiyona dön
git checkout v1.0.0

# Bağımlılıkları güncelle
npm install

# Yeni build
npm run build

# Uygulamayı yeniden başlat
pm2 restart lastikbende
```

## Monitoring

### PM2 Monitoring
```bash
# Uygulama durumu
pm2 status

# Log izleme
pm2 logs lastikbende

# Performans metrikleri
pm2 monit
```

### Nginx Monitoring
```bash
# Nginx durumu
sudo systemctl status nginx

# Log izleme
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Application Insights

1. Azure Application Insights'ı etkinleştirin
2. Instrumentation key'i ortam değişkenlerine ekleyin
3. Performans metriklerini izleyin

### Log Analytics

1. Log Analytics workspace oluşturun
2. Diagnostic settings'i yapılandırın
3. Log sorgularını oluşturun

## Backup ve Recovery

### Veritabanı Yedekleme
```bash
# Günlük yedekleme
./scripts/backup-db.sh

# Yedekten geri yükleme
./scripts/restore-db.sh
```

### Dosya Yedekleme
```bash
# Medya dosyaları yedekleme
./scripts/backup-media.sh

# Yedekten geri yükleme
./scripts/restore-media.sh
```

### Backup Stratejisi

1. Günlük otomatik yedekleme
2. Haftalık tam yedekleme
3. Aylık arşivleme

### Recovery Plan

1. Yedekten geri yükleme prosedürü
2. Failover senaryoları
3. Disaster recovery planı

## SSL/TLS Yapılandırması

1. SSL sertifikası edinin
2. Azure App Service'de SSL ayarlarını yapılandırın
3. HTTPS yönlendirmesini etkinleştirin

## Scaling

### Otomatik Scaling

1. Scale rules tanımlayın
2. Metric thresholds belirleyin
3. Instance sayısını ayarlayın

### Manual Scaling

1. App Service planını seçin
2. Instance sayısını manuel olarak ayarlayın
3. Pricing tier'ı güncelleyin

## Maintenance

### Güncellemeler

1. Dependency güncellemeleri
2. Security patches
3. Major version upgrades

### Monitoring

1. Health checks
2. Performance monitoring
3. Error tracking

## Troubleshooting

### Yaygın Sorunlar

1. Build hataları
2. Deployment hataları
3. Runtime hataları

### Debugging

1. Log analizi
2. Remote debugging
3. Performance profiling

## Güvenlik Kontrolleri

### Dağıtım Sonrası
1. Firewall yapılandırması
2. SSL sertifika kontrolü
3. Port taraması
4. Güvenlik güncellemeleri

### Düzenli Kontroller
1. Log analizi
2. Performans izleme
3. Güvenlik taraması
4. Yedekleme kontrolü 