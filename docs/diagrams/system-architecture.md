# Sistem Mimarisi Diyagramı

```mermaid
graph TB
    subgraph Client
        Browser[Web Browser]
        Mobile[Mobile App]
    end

    subgraph Frontend
        NextJS[Next.js App]
        React[React Components]
        Tailwind[Tailwind CSS]
        i18n[i18n]
    end

    subgraph Backend
        API[API Routes]
        WS[WebSocket Server]
        Auth[JWT Auth]
    end

    subgraph External
        Azure[Azure Vision API]
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> React
    React --> Tailwind
    NextJS --> i18n
    NextJS --> API
    NextJS --> WS
    API --> Auth
    API --> Azure
    API --> DB
    WS --> Redis
    DB --> Redis
```

## Bileşen Açıklamaları

### Client Katmanı
- **Web Browser**: Modern web tarayıcıları
- **Mobile App**: Mobil uygulama (gelecek)

### Frontend Katmanı
- **Next.js App**: Ana uygulama framework'ü
- **React Components**: UI bileşenleri
- **Tailwind CSS**: Stil framework'ü
- **i18n**: Çoklu dil desteği

### Backend Katmanı
- **API Routes**: REST API endpoint'leri
- **WebSocket Server**: Gerçek zamanlı iletişim
- **JWT Auth**: Kimlik doğrulama

### External Servisler
- **Azure Vision API**: Görüntü analizi
- **PostgreSQL**: Ana veritabanı
- **Redis Cache**: Önbellek ve oturum yönetimi 