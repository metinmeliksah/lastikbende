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

### 2. Form Doğrulama

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

### 3. Marka ve Model Listesi

#### GET /brands
Marka listesini getirir.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "models": ["string"]
    }
  ]
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

#### 2. Analiz Tamamlandı
```json
{
  "event": "analysis:complete",
  "data": {
    "analysisId": "string",
    "result": {
      // Analiz sonuçları
    }
  }
}
```

#### 3. Hata Oluştu
```json
{
  "event": "error:occurred",
  "data": {
    "code": "string",
    "message": "string",
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

## Versiyonlama

API versiyonları URL'de belirtilir:
- v1: Mevcut versiyon
- v2: Geliştirme aşamasında

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