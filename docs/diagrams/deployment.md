# Deployment Diyagramı

```mermaid
graph TB
    subgraph Azure Cloud
        subgraph App Service
            NextJS[Next.js App]
            API[API Routes]
            WS[WebSocket Server]
        end

        subgraph Azure Services
            Vision[Azure Vision API]
            Storage[Azure Storage]
            CDN[Azure CDN]
        end

        subgraph Database
            PostgreSQL[(PostgreSQL)]
            Redis[(Redis Cache)]
        end
    end

    subgraph CI/CD
        GitHub[GitHub]
        Actions[GitHub Actions]
        Docker[Docker Registry]
    end

    subgraph Monitoring
        Insights[Application Insights]
        Logs[Log Analytics]
        Alerts[Azure Alerts]
    end

    GitHub --> Actions
    Actions --> Docker
    Docker --> NextJS
    NextJS --> API
    API --> Vision
    API --> PostgreSQL
    WS --> Redis
    NextJS --> Storage
    Storage --> CDN
    NextJS --> Insights
    Insights --> Logs
    Logs --> Alerts
```

## Deployment Bileşenleri

### Azure Cloud
- **App Service**: Web uygulaması hosting
- **Azure Services**: AI ve depolama servisleri
- **Database**: Veritabanı servisleri

### CI/CD Pipeline
- **GitHub**: Kod deposu
- **GitHub Actions**: Otomatik deployment
- **Docker Registry**: Container registry

### Monitoring
- **Application Insights**: Performans izleme
- **Log Analytics**: Log yönetimi
- **Azure Alerts**: Uyarı sistemi

## Deployment Adımları

1. Kod değişiklikleri GitHub'a push edilir
2. GitHub Actions otomatik olarak tetiklenir
3. Docker image build edilir
4. Image Azure Container Registry'ye push edilir
5. App Service yeni image'ı deploy eder
6. Monitoring sistemleri değişiklikleri izler 