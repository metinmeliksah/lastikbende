# Veri Akış Diyagramı

```mermaid
sequenceDiagram
    participant User as Kullanıcı
    participant Frontend as Next.js Frontend
    participant API as API Routes
    participant Azure as Azure Vision API
    participant DB as PostgreSQL
    participant WS as WebSocket Server

    User->>Frontend: Lastik görüntüsü yükle
    Frontend->>API: POST /api/analyze
    API->>Azure: Görüntü analizi isteği
    Azure-->>API: Analiz sonuçları
    API->>DB: Sonuçları kaydet
    API-->>Frontend: Analiz tamamlandı
    Frontend->>WS: WebSocket bağlantısı
    WS-->>Frontend: Gerçek zamanlı güncellemeler
    Frontend-->>User: Sonuçları göster

    Note over User,Frontend: Kullanıcı arayüzü
    Note over Frontend,API: API istekleri
    Note over API,Azure: AI analizi
    Note over API,DB: Veri depolama
    Note over Frontend,WS: Gerçek zamanlı iletişim
```

## Akış Açıklamaları

### 1. Kullanıcı Etkileşimi
- Kullanıcı lastik görüntüsünü yükler
- Form verilerini doldurur
- Analiz başlatır

### 2. API İşlemleri
- Görüntü doğrulama
- Azure Vision API'ye gönderme
- Sonuçları işleme
- Veritabanına kaydetme

### 3. Gerçek Zamanlı İletişim
- WebSocket bağlantısı
- İlerleme güncellemeleri
- Hata bildirimleri
- Sonuç iletimi

### 4. Veri Depolama
- Kullanıcı bilgileri
- Analiz sonuçları
- Görüntü referansları
- İşlem geçmişi 