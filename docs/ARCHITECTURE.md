# Sistem Mimarisi

## Genel Bakış

LastikBende, modern web teknolojileri kullanılarak geliştirilmiş bir lastik analiz platformudur. Sistem mimarisi aşağıdaki ana bileşenlerden oluşur:

- Frontend (Next.js)
- Backend API (Next.js API Routes)
- Azure Computer Vision API
- WebSocket Server
- Veritabanı (PostgreSQL)

> Detaylı sistem mimarisi diyagramı için [System Architecture Diagram](diagrams/system-architecture.md) dosyasını inceleyin.
> Veri akış diyagramı için [Data Flow Diagram](diagrams/data-flow.md) dosyasını inceleyin.

## Mimari Diyagram

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Client Browser  +---->+  Next.js Frontend+---->+  Next.js Backend |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +--------+---------+
                                                         |
                                                         v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  WebSocket Server+<--->+  Azure Vision API+<--->+    PostgreSQL    |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

## Frontend Mimarisi

### Teknoloji Yığını

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- i18n
- WebSocket Client

### Bileşen Yapısı

```
components/
├── ui/               # Temel UI bileşenleri
├── forms/            # Form bileşenleri
├── layout/           # Layout bileşenleri
└── features/         # Özellik bazlı bileşenler
    ├── analysis/     # Analiz özelliği
    ├── auth/         # Kimlik doğrulama
    └── dashboard/    # Dashboard
```

### State Yönetimi

- React Context API
- Custom Hooks
- Local Storage
- Session Storage

## Backend Mimarisi

### API Katmanı

```
app/
├── api/              # API Routes
│   ├── analyze/      # Analiz endpoint'leri
│   ├── auth/         # Kimlik doğrulama
│   └── ws/           # WebSocket
└── lib/              # Yardımcı fonksiyonlar
    ├── azure/        # Azure entegrasyonu
    ├── db/           # Veritabanı işlemleri
    └── validation/   # Doğrulama
```

### Veritabanı Şeması

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses
CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  image_url TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Güvenlik Mimarisi

### Kimlik Doğrulama

- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Session yönetimi
- Rate limiting

### Veri Güvenliği

- HTTPS/TLS
- Input validasyonu
- SQL injection koruması
- XSS koruması
- CSRF koruması

## Ölçeklendirme

### Yatay Ölçeklendirme

- Load balancing
- CDN kullanımı
- Caching stratejisi
- Database sharding

### Dikey Ölçeklendirme

- Resource optimization
- Database indexing
- Query optimization
- Memory management

## Monitoring

### Metrikler

- Response time
- Error rate
- CPU usage
- Memory usage
- Database performance

### Logging

- Application logs
- Error logs
- Access logs
- Performance logs

## Deployment

### CI/CD Pipeline

1. Code commit
2. Automated testing
3. Build
4. Deployment
5. Health check

### Environments

- Development
- Staging
- Production

## Disaster Recovery

### Backup Stratejisi

- Database backups
- File storage backups
- Configuration backups
- Code repository backups

### Recovery Plan

1. Service restoration
2. Data recovery
3. System verification
4. User notification

## Performance Optimization

### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

### Backend

- Caching
- Query optimization
- Connection pooling
- Resource management

## API Design

### REST Endpoints

- GET /api/analyses
- POST /api/analyze
- GET /api/brands
- POST /api/validate

### WebSocket Events

- analysis:progress
- analysis:complete
- error:occurred

## Error Handling

### Error Types

- Validation errors
- Authentication errors
- Business logic errors
- System errors

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "string"
  }
}
```

## Future Considerations

### Planlanan Geliştirmeler

1. Mobile app
2. AI model geliştirme
3. Real-time collaboration
4. Advanced analytics

### Teknik Borç

1. Test coverage artırımı
2. Documentation güncellemesi
3. Performance optimizasyonu
4. Security hardening 