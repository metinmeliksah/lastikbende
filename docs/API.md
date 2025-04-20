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

## Endpoint'ler

### 1. Lastik Analizi

#### POST /analyze
Lastik görüntüsünü analiz eder.

**Request Body:**
```json
{
  "imageUrl": "base64_encoded_image",
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
    "kullanimOnerisi": "string"
  }
}
```

### 2. E-Ticaret API'leri

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

### 3. Kullanıcı API'leri

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
      "lastName": "string"
    }
  }
}
```

### 4. Form Doğrulama

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

## WebSocket Endpoint'leri

### WebSocket Bağlantısı
```
wss://api.lastikbende.com/v1/ws
```

### WebSocket Olayları

#### 1. Analiz İlerlemesi
```json
{
  "event": "analysis:progress",
  "data": {
    "analysisId": "string",
    "progress": "number",
    "status": "string"
  }
}
```

#### 2. Stok Güncellemesi
```json
{
  "event": "stock:update",
  "data": {
    "productId": "string",
    "stock": "number"
  }
}
```

#### 3. Sipariş Durumu
```json
{
  "event": "order:status",
  "data": {
    "orderId": "string",
    "status": "string",
    "details": "string"
  }
}
```

## Hata Kodları

| Kod  | Açıklama                    |
|------|----------------------------|
| 400  | Geçersiz İstek            |
| 401  | Yetkisiz Erişim           |
| 403  | Erişim Reddedildi          |
| 404  | Bulunamadı                 |
| 429  | Çok Fazla İstek            |
| 500  | Sunucu Hatası             |

## Hata Yanıtları

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

## Rate Limiting

- Her IP için dakikada maksimum 60 istek
- Her kullanıcı için dakikada maksimum 100 istek
- Analiz API'si için günlük maksimum 1000 istek

## Versiyonlama

API versiyonları URL'de belirtilir:
- v1: Mevcut versiyon
- v2: Geliştirme aşamasında (E-ticaret özellikleri)

## Örnek Kullanımlar

### cURL ile Analiz İsteği
```bash
curl -X POST https://api.lastikbende.com/v1/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "base64_encoded_image",
    "formData": {
      "lastikTipi": "Yaz",
      "marka": "Michelin",
      "model": "Pilot Sport 4",
      "ebat": "225/45R17",
      "uretimYili": 2023,
      "kilometre": 15000
    }
  }'
```

### Python ile Form Doğrulama
```python
import requests

response = requests.post(
    'https://api.lastikbende.com/v1/validate',
    headers={'Authorization': 'Bearer YOUR_TOKEN'},
    json={
        'field': 'marka',
        'value': 'Michelin',
        'context': {
            'lastikTipi': 'Yaz'
        }
    }
)
print(response.json())
```

### JavaScript ile WebSocket Bağlantısı
```javascript
const ws = new WebSocket('wss://api.lastikbende.com/v1/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.event === 'analysis:progress') {
    console.log(`Analiz ilerlemesi: ${data.data.progress}%`);
  } else if (data.event === 'analysis:complete') {
    console.log('Analiz tamamlandı:', data.data.result);
  } else if (data.event === 'error:occurred') {
    console.error('Hata oluştu:', data.data.message);
  }
};
``` 