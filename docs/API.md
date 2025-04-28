# API Dokümantasyonu

## Genel Bilgiler

### Base URL
```
https://api.lastikbende.com/v1
```

### Kimlik Doğrulama
API istekleri için JWT token kullanılmaktadır. Token'ı header'da şu şekilde göndermelisiniz:
```
Authorization: Bearer <token>
```

### Hata Kodları

| Kod | Açıklama | Çözüm Önerisi |
|-----|----------|---------------|
| 400 | Geçersiz istek - İstek parametreleri hatalı | İstek parametrelerini kontrol edin ve API dokümantasyonuna uygun formatta gönderin |
| 401 | Yetkisiz erişim - Kimlik doğrulama gerekli | Geçerli bir JWT token ile kimlik doğrulaması yapın |
| 403 | Erişim reddedildi - Yeterli yetki yok | Kullanıcı rolünüzü ve yetkilerinizi kontrol edin |
| 404 | Bulunamadı - İstenen kaynak mevcut değil | İstek yaptığınız kaynağın varlığını kontrol edin |
| 429 | Çok fazla istek - Rate limit aşıldı | Rate limit süresinin dolmasını bekleyin veya premium plana geçin |
| 500 | Sunucu hatası - İşlem sırasında bir hata oluştu | Hata detaylarını inceleyin ve destek ekibiyle iletişime geçin |

### Yanıt Formatı

Başarılı yanıtlar:
```json
{
  "success": true,
  "data": {
    // Yanıt verileri
  },
  "metadata": {
    "timestamp": "2024-04-25T10:30:00Z",
    "requestId": "req_123456",
    "version": "1.0.0"
  }
}
```

Hata yanıtları:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı",
    "details": "Detaylı hata açıklaması (opsiyonel)",
    "field": "Hatalı alan adı (opsiyonel)",
    "suggestions": ["Çözüm önerisi 1", "Çözüm önerisi 2"]
  },
  "metadata": {
    "timestamp": "2024-04-25T10:30:00Z",
    "requestId": "req_123456",
    "version": "1.0.0"
  }
}
```

## Endpoint'ler

### 1. Kimlik Doğrulama API'leri

#### POST /auth/register
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "token": "string"
  }
}
```

#### POST /auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string"
    }
  }
}
```

#### POST /auth/forgot-password
Şifre sıfırlama e-postası gönderir.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi"
}
```

#### POST /auth/reset-password
Şifreyi sıfırlar.

**Request Body:**
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifreniz başarıyla güncellendi"
}
```

### 2. Lastik Analizi API'leri

#### POST /analysis/upload
Lastik görüntüsünü yükler.

**Request Body:**
```
multipart/form-data
- file: Lastik görüntüsü (jpg, png, jpeg)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "string",
    "uploadId": "string"
  }
}
```

#### POST /analysis/analyze
Lastik görüntüsünü analiz eder.

**Request Body:**
```json
{
  "imageUrl": "string",
  "formData": {
    "lastikTipi": "string",
    "marka": "string",
    "model": "string",
    "ebat": "string",
    "uretimYili": "number",
    "kilometre": "number"
  },
  "detectOnly": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastikDurumu": "string",
    "sorunlar": [
      {
        "tip": "string",
        "seviye": "string",
        "aciklama": "string",
        "oneri": "string"
      }
    ],
    "guvenlikSkoru": "number",
    "kullanimOnerisi": "string",
    "kalanOmur": "number",
    "disDerinligi": "number",
    "asınmaOranı": "number"
  }
}
```

#### GET /analysis/history
Kullanıcının analiz geçmişini getirir.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
sort: string (options: date_desc, date_asc)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "imageUrl": "string",
        "lastikTipi": "string",
        "marka": "string",
        "model": "string",
        "ebat": "string",
        "uretimYili": "number",
        "kilometre": "number",
        "guvenlikSkoru": "number",
        "createdAt": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### GET /analysis/{id}
Belirli bir analiz detayını getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "imageUrl": "string",
    "lastikTipi": "string",
    "marka": "string",
    "model": "string",
    "ebat": "string",
    "uretimYili": "number",
    "kilometre": "number",
    "guvenlikSkoru": "number",
    "kalanOmur": "number",
    "disDerinligi": "number",
    "asınmaOranı": "number",
    "sorunlar": [
      {
        "tip": "string",
        "seviye": "string",
        "aciklama": "string",
        "oneri": "string"
      }
    ],
    "kullanimOnerisi": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### POST /analysis/reports
Analiz raporu oluşturur.

**Request Body:**
```json
{
  "analysisId": "string",
  "reportType": "string (options: pdf, excel, word)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportUrl": "string",
    "reportId": "string"
  }
}
```

### 3. E-Ticaret API'leri

#### GET /products
Lastik ürünlerini listeler.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
sort: string (options: price_asc, price_desc, name_asc, name_desc)
filter[brand]: string
filter[model]: string
filter[size]: string
filter[season]: string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "size": "string",
        "season": "string",
        "price": "number",
        "discountedPrice": "number",
        "stock": "number",
        "images": ["string"],
        "specifications": {
          "width": "number",
          "height": "number",
          "diameter": "number",
          "loadIndex": "number",
          "speedIndex": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### GET /products/{id}
Belirli bir ürün detayını getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "brand": "string",
    "model": "string",
    "size": "string",
    "season": "string",
    "price": "number",
    "discountedPrice": "number",
    "stock": "number",
    "images": ["string"],
    "specifications": {
      "width": "number",
      "height": "number",
      "diameter": "number",
      "loadIndex": "number",
      "speedIndex": "string"
    },
    "description": "string",
    "features": ["string"],
    "reviews": [
      {
        "id": "string",
        "userId": "string",
        "rating": "number",
        "comment": "string",
        "createdAt": "string"
      }
    ],
    "averageRating": "number"
  }
}
```

#### GET /cart
Kullanıcının sepetini getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "cartId": "string",
    "items": [
      {
        "productId": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "size": "string",
        "price": "number",
        "quantity": "number",
        "total": "number"
      }
    ],
    "subtotal": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

#### POST /cart
Sepete ürün ekler.

**Request Body:**
```json
{
  "productId": "string",
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cartId": "string",
    "items": [
      {
        "productId": "string",
        "quantity": "number",
        "price": "number",
        "total": "number"
      }
    ],
    "subtotal": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

#### PUT /cart/{productId}
Sepetteki ürün miktarını günceller.

**Request Body:**
```json
{
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cartId": "string",
    "items": [
      {
        "productId": "string",
        "quantity": "number",
        "price": "number",
        "total": "number"
      }
    ],
    "subtotal": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

#### DELETE /cart/{productId}
Sepetten ürün siler.

**Response:**
```json
{
  "success": true,
  "data": {
    "cartId": "string",
    "items": [
      {
        "productId": "string",
        "quantity": "number",
        "price": "number",
        "total": "number"
      }
    ],
    "subtotal": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

#### POST /orders
Sipariş oluşturur.

**Request Body:**
```json
{
  "cartId": "string",
  "shippingAddress": {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string",
    "postalCode": "string"
  },
  "billingAddress": {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string",
    "postalCode": "string"
  },
  "paymentMethod": "string",
  "installment": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "status": "string",
    "paymentUrl": "string",
    "total": "number"
  }
}
```

#### GET /orders
Kullanıcının siparişlerini listeler.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
status: string (options: pending, paid, shipped, delivered, cancelled)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "status": "string",
        "total": "number",
        "createdAt": "string",
        "items": [
          {
            "productId": "string",
            "name": "string",
            "quantity": "number",
            "price": "number"
          }
        ]
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### GET /orders/{id}
Belirli bir sipariş detayını getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "string",
    "total": "number",
    "createdAt": "string",
    "updatedAt": "string",
    "shippingAddress": {
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "address": "string",
      "city": "string",
      "district": "string",
      "postalCode": "string"
    },
    "billingAddress": {
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "address": "string",
      "city": "string",
      "district": "string",
      "postalCode": "string"
    },
    "paymentMethod": "string",
    "installment": "number",
    "items": [
      {
        "productId": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "size": "string",
        "quantity": "number",
        "price": "number",
        "total": "number"
      }
    ],
    "shipping": "number",
    "subtotal": "number"
  }
}
```

### 4. Kullanıcı Profili API'leri

#### GET /profile
Kullanıcı profilini getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "role": "string",
    "createdAt": "string"
  }
}
```

#### PUT /profile
Kullanıcı profilini günceller.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "role": "string",
    "updatedAt": "string"
  }
}
```

#### PUT /profile/password
Kullanıcı şifresini günceller.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifreniz başarıyla güncellendi"
}
```

### 5. Form Doğrulama API'leri

#### POST /validate
Form alanlarını doğrular.

**Request Body:**
```json
{
  "field": "string",
  "value": "string",
  "context": {
    "lastikTipi": "string",
    "marka": "string",
    "model": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "suggestions": ["string"]
}
```

## WebSocket API

### Bağlantı

```
wss://api.lastikbende.com/v1/ws
```

### Kimlik Doğrulama

WebSocket bağlantısı için JWT token'ı URL parametresi olarak gönderilmelidir:

```
wss://api.lastikbende.com/v1/ws?token=<jwt_token>
```

### Olaylar

#### analysis:progress
Analiz ilerleme durumunu bildirir.

```json
{
  "event": "analysis:progress",
  "data": {
    "analysisId": "string",
    "progress": "number",
    "status": "string",
    "message": "string"
  }
}
```

#### analysis:complete
Analiz tamamlandığında bildirir.

```json
{
  "event": "analysis:complete",
  "data": {
    "analysisId": "string",
    "result": {
      "lastikDurumu": "string",
      "guvenlikSkoru": "number",
      "kalanOmur": "number"
    }
  }
}
```

#### error:occurred
Hata oluştuğunda bildirir.

```json
{
  "event": "error:occurred",
  "data": {
    "code": "string",
    "message": "string"
  }
}
```

## Rate Limiting

API istekleri için rate limiting politikaları:

### Ücretsiz Plan
- Kimlik doğrulama olmadan: 60 istek/saat
- Kimlik doğrulama ile: 1000 istek/saat
- WebSocket bağlantısı: 1 bağlantı

### Premium Plan
- Kimlik doğrulama olmadan: 300 istek/saat
- Kimlik doğrulama ile: 5000 istek/saat
- WebSocket bağlantısı: 5 bağlantı

### Kurumsal Plan
- Özel limitler
- Özel IP whitelist
- Özel rate limiting kuralları

Rate limit aşıldığında, API 429 Too Many Requests yanıtı döndürür:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit aşıldı",
    "details": "Lütfen daha sonra tekrar deneyin",
    "retryAfter": 3600
  }
}
```

Rate limit bilgileri yanıt başlıklarında bulunur:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1620000000
X-RateLimit-Policy: "standard"
```

## API Versiyonlama

API'nin ana sürümü URL'de belirtilir (örn. `/v1/`). Versiyonlama stratejisi şu şekildedir:

### Major Versiyon (v1, v2, ...)
- Geriye dönük uyumsuz değişiklikler
- Yeni endpoint'ler
- Mevcut endpoint'lerin yapısında değişiklikler
- Veri modellerinde önemli değişiklikler

### Minor Versiyon (v1.1, v1.2, ...)
- Geriye dönük uyumlu yeni özellikler
- Yeni endpoint parametreleri
- Yeni yanıt alanları
- Performans iyileştirmeleri

### Patch Versiyon (v1.1.1, v1.1.2, ...)
- Hata düzeltmeleri
- Güvenlik yamaları
- Dokümantasyon güncellemeleri

## Webhook Entegrasyonu

### Webhook Olayları

| Olay | Açıklama | Veri Örneği |
|------|----------|-------------|
| `order.created` | Yeni sipariş oluşturulduğunda | ```json { "orderId": "123", "total": 1500.00, "status": "pending" } ``` |
| `order.updated` | Sipariş durumu güncellendiğinde | ```json { "orderId": "123", "oldStatus": "pending", "newStatus": "paid" } ``` |
| `order.cancelled` | Sipariş iptal edildiğinde | ```json { "orderId": "123", "reason": "customer_request" } ``` |
| `analysis.completed` | Lastik analizi tamamlandığında | ```json { "analysisId": "123", "guvenlikSkoru": 85, "kalanOmur": 70 } ``` |
| `user.registered` | Yeni kullanıcı kaydı yapıldığında | ```json { "userId": "123", "email": "user@example.com" } ``` |
| `payment.succeeded` | Ödeme başarılı olduğunda | ```json { "paymentId": "123", "amount": 1500.00, "currency": "TRY" } ``` |
| `payment.failed` | Ödeme başarısız olduğunda | ```json { "paymentId": "123", "error": "insufficient_funds" } ``` |

### Webhook Yapılandırması

1. Webhook URL'si oluşturma:
```bash
curl -X POST https://api.lastikbende.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "events": ["order.created", "order.updated"],
    "secret": "your-webhook-secret"
  }'
```

2. Webhook imza doğrulama:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}
```

3. Webhook yanıt formatı:
```json
{
  "success": true,
  "message": "Webhook başarıyla işlendi",
  "webhookId": "wh_123456"
}
```

### Webhook Yeniden Deneme Politikası

Webhook gönderimi başarısız olduğunda:
1. İlk 5 dakika: Her 30 saniyede bir
2. Sonraki 1 saat: Her 5 dakikada bir
3. Sonraki 24 saat: Her 1 saatte bir
4. 24 saat sonra: Manuel müdahale gerekir

## Yeni API Endpoint'leri

### 1. Lastik Karşılaştırma API'leri

#### POST /comparison/create
Lastik karşılaştırma listesi oluşturur.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "tires": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparisonId": "string",
    "name": "string",
    "description": "string",
    "tires": [
      {
        "productId": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "specifications": {
          "width": "number",
          "height": "number",
          "diameter": "number",
          "loadIndex": "number",
          "speedIndex": "string"
        },
        "price": "number",
        "quantity": "number"
      }
    ],
    "createdAt": "string"
  }
}
```

#### GET /comparison/{id}
Karşılaştırma listesi detaylarını getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "comparisonId": "string",
    "name": "string",
    "description": "string",
    "tires": [
      {
        "productId": "string",
        "name": "string",
        "brand": "string",
        "model": "string",
        "specifications": {
          "width": "number",
          "height": "number",
          "diameter": "number",
          "loadIndex": "number",
          "speedIndex": "string"
        },
        "price": "number",
        "quantity": "number",
        "features": ["string"],
        "reviews": {
          "averageRating": "number",
          "totalReviews": "number"
        }
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. Lastik Bakım Hatırlatıcı API'leri

#### POST /maintenance/reminder
Lastik bakım hatırlatıcısı oluşturur.

**Request Body:**
```json
{
  "tireId": "string",
  "installationDate": "string",
  "expectedLifespan": "number",
  "mileage": "number",
  "reminderType": "string (options: rotation, pressure, alignment, replacement)",
  "reminderDate": "string",
  "notificationPreferences": {
    "email": "boolean",
    "sms": "boolean",
    "push": "boolean"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reminderId": "string",
    "tireId": "string",
    "installationDate": "string",
    "expectedLifespan": "number",
    "mileage": "number",
    "reminderType": "string",
    "reminderDate": "string",
    "status": "string",
    "notificationPreferences": {
      "email": "boolean",
      "sms": "boolean",
      "push": "boolean"
    },
    "createdAt": "string"
  }
}
```

#### GET /maintenance/reminders
Kullanıcının bakım hatırlatıcılarını listeler.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
status: string (options: active, completed, cancelled)
type: string (options: rotation, pressure, alignment, replacement)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "reminderId": "string",
        "tireId": "string",
        "reminderType": "string",
        "reminderDate": "string",
        "status": "string",
        "createdAt": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### 3. Lastik Performans Analizi API'leri

#### POST /performance/analyze
Lastik performans analizi yapar.

**Request Body:**
```json
{
  "tireId": "string",
  "usageData": {
    "mileage": "number",
    "installationDate": "string",
    "drivingConditions": ["string"],
    "maintenanceHistory": [
      {
        "date": "string",
        "type": "string",
        "description": "string"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "string",
    "tireId": "string",
    "performanceScore": "number",
    "metrics": {
      "durability": "number",
      "fuelEfficiency": "number",
      "noiseLevel": "number",
      "gripLevel": "number"
    },
    "recommendations": [
      {
        "type": "string",
        "description": "string",
        "priority": "string"
      }
    ],
    "estimatedLifespan": "number",
    "createdAt": "string"
  }
}
```

## API Kullanım Örnekleri

### 1. Lastik Analizi ve Sipariş Oluşturma

```python
import requests
import json

# API kimlik bilgileri
API_KEY = "your_api_key"
BASE_URL = "https://api.lastikbende.com/v1"

# Lastik görüntüsü yükleme
def upload_tire_image(image_path):
    with open(image_path, "rb") as image:
        files = {"file": image}
        response = requests.post(
            f"{BASE_URL}/analysis/upload",
            headers={"Authorization": f"Bearer {API_KEY}"},
            files=files
        )
        return response.json()

# Lastik analizi
def analyze_tire(image_url):
    data = {
        "imageUrl": image_url,
        "formData": {
            "lastikTipi": "yaz",
            "marka": "Michelin",
            "model": "Pilot Sport 4",
            "ebat": "225/45R17",
            "uretimYili": 2023,
            "kilometre": 15000
        }
    }
    response = requests.post(
        f"{BASE_URL}/analysis/analyze",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=data
    )
    return response.json()

# Sipariş oluşturma
def create_order(analysis_result):
    data = {
        "cartId": "cart_123",
        "shippingAddress": {
            "firstName": "John",
            "lastName": "Doe",
            "phone": "+905551234567",
            "address": "Atatürk Cad. No:123",
            "city": "İstanbul",
            "district": "Kadıköy",
            "postalCode": "34700"
        },
        "billingAddress": {
            "firstName": "John",
            "lastName": "Doe",
            "phone": "+905551234567",
            "address": "Atatürk Cad. No:123",
            "city": "İstanbul",
            "district": "Kadıköy",
            "postalCode": "34700"
        },
        "paymentMethod": "credit_card",
        "installment": 1
    }
    response = requests.post(
        f"{BASE_URL}/orders",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=data
    )
    return response.json()

# Örnek kullanım
def main():
    # Lastik görüntüsü yükle
    upload_result = upload_tire_image("tire_image.jpg")
    image_url = upload_result["data"]["imageUrl"]
    
    # Lastik analizi yap
    analysis_result = analyze_tire(image_url)
    
    # Sipariş oluştur
    if analysis_result["data"]["guvenlikSkoru"] < 70:
        order_result = create_order(analysis_result)
        print(f"Sipariş oluşturuldu: {order_result['data']['orderId']}")
    else:
        print("Lastik güvenli durumda, sipariş gerekmiyor")

if __name__ == "__main__":
    main()
```

### 2. WebSocket ile Gerçek Zamanlı Analiz Takibi

```javascript
const WebSocket = require('ws');

class TireAnalysisClient {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.callbacks = {};
  }

  connect() {
    this.ws = new WebSocket(`wss://api.lastikbende.com/v1/ws?token=${this.token}`);

    this.ws.on('open', () => {
      console.log('WebSocket bağlantısı kuruldu');
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      const callback = this.callbacks[message.event];
      if (callback) {
        callback(message.data);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket hatası:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket bağlantısı kapandı');
      // Yeniden bağlanma mantığı
      setTimeout(() => this.connect(), 5000);
    });
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  startAnalysis(imageUrl) {
    this.ws.send(JSON.stringify({
      event: 'analysis:start',
      data: { imageUrl }
    }));
  }
}

// Kullanım örneği
const client = new TireAnalysisClient('your_jwt_token');

client.on('analysis:progress', (data) => {
  console.log(`Analiz ilerlemesi: ${data.progress}%`);
});

client.on('analysis:complete', (data) => {
  console.log('Analiz tamamlandı:', data);
});

client.on('error:occurred', (data) => {
  console.error('Hata oluştu:', data);
});

client.connect();

// Analiz başlat
client.startAnalysis('https://example.com/tire-image.jpg');
```

## API Güvenlik Önlemleri

1. **JWT Token Güvenliği**
   - Token'lar 7 gün geçerlidir
   - Refresh token'lar 30 gün geçerlidir
   - Token'lar her istekte yenilenir
   - Token'lar blacklist'te kontrol edilir

2. **Rate Limiting**
   - IP bazlı rate limiting
   - Kullanıcı bazlı rate limiting
   - Endpoint bazlı rate limiting
   - Rate limit aşımında otomatik IP engelleme

3. **Veri Şifreleme**
   - Tüm iletişim TLS 1.3 ile şifrelenir
   - Hassas veriler AES-256 ile şifrelenir
   - Şifreler bcrypt ile hash'lenir

4. **Güvenlik Başlıkları**
   - CORS politikası
   - Content Security Policy
   - XSS koruması
   - CSRF koruması

5. **Güvenlik Denetimi**
   - Düzenli güvenlik taramaları
   - Penetrasyon testleri
   - Güvenlik açığı raporlama
   - Güvenlik güncellemeleri

## API Hata Yönetimi

1. **Hata Kodları ve Mesajları**
   - Anlamlı hata kodları
   - Detaylı hata mesajları
   - Çözüm önerileri
   - Hata izleme ve loglama

2. **Hata İzleme**
   - Hata logları
   - Hata metrikleri
   - Hata bildirimleri
   - Hata analizi

3. **Hata Kurtarma**
   - Otomatik yeniden deneme
   - Fallback mekanizmaları
   - Circuit breaker pattern
   - Graceful degradation

## API Performans Optimizasyonu

1. **Önbellekleme**
   - Response caching
   - CDN kullanımı
   - Cache invalidation
   - Cache headers

2. **Veri Optimizasyonu**
   - Response compression
   - Pagination
   - Field selection
   - Data filtering

3. **Bağlantı Optimizasyonu**
   - Keep-alive connections
   - Connection pooling
   - Load balancing
   - Rate limiting

4. **Kod Optimizasyonu**
   - Async/await kullanımı
   - Batch işlemler
   - Lazy loading
   - Resource pooling 