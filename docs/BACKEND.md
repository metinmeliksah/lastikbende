# Backend Dokümantasyonu

## Genel Bakış

LastikBende backend servisleri Next.js API Routes kullanılarak geliştirilmiştir. Azure Computer Vision API ve OpenAI GPT-4 entegrasyonları ile lastik analizi ve raporlama özelliklerini sağlar.

## Teknoloji Yığını

- **Framework**: Next.js API Routes
- **Veritabanı**: PostgreSQL
- **Cache**: Redis
- **AI Servisleri**: 
  - Azure Computer Vision API
  - OpenAI GPT-4
- **Dosya Depolama**: Azure Blob Storage
- **Email**: SendGrid
- **PDF İşleme**: Puppeteer
- **Excel İşleme**: ExcelJS
- **Word İşleme**: Docx

## API Mimarisi

### 1. Route Yapısı

```
app/
├── api/
│   ├── auth/              # Kimlik doğrulama
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── analysis/          # Lastik analizi
│   │   ├── upload/
│   │   ├── analyze/
│   │   └── reports/
│   ├── products/          # Ürün yönetimi
│   │   ├── list/
│   │   ├── create/
│   │   └── update/
│   └── orders/            # Sipariş yönetimi
│       ├── create/
│       ├── status/
│       └── history/
```

### 2. Middleware Yapısı

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CORS yapılandırması
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Rate limiting
  const ip = request.ip ?? '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return response;
}
```

## Servis Katmanı

### 1. Azure Vision Servisi

```typescript
// services/azure-vision.ts
export class AzureVisionService {
  private client: ComputerVisionClient;

  constructor() {
    this.client = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY } }),
      process.env.AZURE_VISION_ENDPOINT
    );
  }

  async analyzeImage(imageUrl: string): Promise<AnalysisResult> {
    try {
      const result = await this.client.analyzeImage(imageUrl, {
        visualFeatures: ['Tags', 'Objects', 'Description'],
        language: 'tr'
      });

      return this.processAnalysisResult(result);
    } catch (error) {
      throw new ApiError('Azure Vision API hatası', 500);
    }
  }

  private processAnalysisResult(result: any): AnalysisResult {
    // Sonuç işleme mantığı
  }
}
```

### 2. OpenAI Servisi

```typescript
// services/openai.ts
export class OpenAIService {
  private client: OpenAIApi;

  constructor() {
    this.client = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateReport(analysisData: AnalysisData): Promise<string> {
    try {
      const prompt = this.buildReportPrompt(analysisData);
      const response = await this.client.createCompletion({
        model: 'gpt-4',
        prompt,
        max_tokens: 1000,
        temperature: 0.7
      });

      return response.data.choices[0].text;
    } catch (error) {
      throw new ApiError('OpenAI API hatası', 500);
    }
  }

  private buildReportPrompt(data: AnalysisData): string {
    // Prompt oluşturma mantığı
  }
}
```

### 3. Raporlama Servisi

```typescript
// services/reporting.ts
export class ReportingService {
  private puppeteer: Browser;
  private excelJS: ExcelJS.Workbook;
  private docx: Document;

  async generatePDFReport(data: ReportData): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // PDF oluşturma mantığı
    
    await browser.close();
    return pdfBuffer;
  }

  async generateExcelReport(data: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Excel oluşturma mantığı
    
    return await workbook.xlsx.writeBuffer();
  }

  async generateWordReport(data: ReportData): Promise<Buffer> {
    const doc = new Document();
    
    // Word oluşturma mantığı
    
    return await doc.save();
  }
}
```

## Veritabanı İşlemleri

### 1. Repository Pattern

```typescript
// repositories/analysis.repository.ts
export class AnalysisRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  async createAnalysis(data: AnalysisData): Promise<Analysis> {
    const query = `
      INSERT INTO tire_analyses (
        user_id, image_url, analysis_result, safety_score
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      data.userId,
      data.imageUrl,
      data.analysisResult,
      data.safetyScore
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getAnalysisById(id: string): Promise<Analysis> {
    const query = `
      SELECT * FROM tire_analyses
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }
}
```

### 2. Cache Yönetimi

```typescript
// services/cache.service.ts
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }
}
```

## Güvenlik

### 1. Kimlik Doğrulama

```typescript
// services/auth.service.ts
export class AuthService {
  private jwt: JwtService;

  constructor() {
    this.jwt = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Geçersiz kimlik bilgileri');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Geçersiz kimlik bilgileri');
    }

    return user;
  }

  generateToken(user: User): string {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });
  }
}
```

### 2. Rate Limiting

```typescript
// services/rate-limit.service.ts
export class RateLimitService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async checkLimit(ip: string, limit: number, window: number): Promise<boolean> {
    const key = `rate-limit:${ip}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }

    return current <= limit;
  }
}
```

## Hata Yönetimi

### 1. Özel Hata Sınıfları

```typescript
// errors/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Yetkisiz erişim') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

### 2. Hata İşleme Middleware

```typescript
// middleware/error-handler.ts
export function errorHandler(
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Bir hata oluştu'
    }
  });
}
```

## Loglama

### 1. Loglama Servisi

```typescript
// services/logger.service.ts
export class LoggerService {
  private winston: Logger;

  constructor() {
    this.winston = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(
        timestamp(),
        json()
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.winston.add(new transports.Console({
        format: simple()
      }));
    }
  }

  info(message: string, meta?: any) {
    this.winston.info(message, meta);
  }

  error(message: string, error?: Error) {
    this.winston.error(message, {
      error: error?.message,
      stack: error?.stack
    });
  }
}
```

## Monitoring

### 1. Health Check

```typescript
// pages/api/health.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };

  try {
    // Veritabanı bağlantı kontrolü
    await db.query('SELECT 1');
    health.database = 'OK';
  } catch (error) {
    health.database = 'ERROR';
  }

  try {
    // Redis bağlantı kontrolü
    await redis.ping();
    health.redis = 'OK';
  } catch (error) {
    health.redis = 'ERROR';
  }

  res.status(200).json(health);
}
```

### 2. Metrik Toplama

```typescript
// services/metrics.service.ts
export class MetricsService {
  private prometheus: Registry;

  constructor() {
    this.prometheus = new Registry();
    
    // HTTP istek sayacı
    this.prometheus.registerMetric(new Counter({
      name: 'http_requests_total',
      help: 'Toplam HTTP istek sayısı',
      labelNames: ['method', 'path', 'status']
    }));

    // Yanıt süresi histogramı
    this.prometheus.registerMetric(new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP istek süresi',
      labelNames: ['method', 'path']
    }));
  }

  recordRequest(method: string, path: string, status: number, duration: number) {
    this.prometheus.increment('http_requests_total', { method, path, status });
    this.prometheus.observe('http_request_duration_seconds', duration, { method, path });
  }
}
``` 