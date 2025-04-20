# LastikBende Gereksinim Analizi

## İçindekiler

- [LastikBende Gereksinim Analizi](#lastikbende-gereksinim-analizi)
  - [İçindekiler](#i̇çindekiler)
  - [1. Genel Gereksinimler](#1-genel-gereksinimler)
    - [1.1. Proje Kapsamı](#11-proje-kapsamı)
    - [1.2. Teknik Altyapı](#12-teknik-altyapı)
    - [1.3. Güvenlik Gereksinimleri](#13-güvenlik-gereksinimleri)
    - [1.4. Performans Gereksinimleri](#14-performans-gereksinimleri)
    - [1.5. Kullanıcı Arayüzü Gereksinimleri](#15-kullanıcı-arayüzü-gereksinimleri)
  - [2. Analiz Modülü Gereksinimleri](#2-analiz-modülü-gereksinimleri)
    - [2.1. Form Bileşenleri](#21-form-bileşenleri)
    - [2.2. Görüntü İşleme Sistemi](#22-görüntü-i̇şleme-sistemi)
    - [2.3. Analiz Sistemi](#23-analiz-sistemi)
    - [2.4. Raporlama Sistemi](#24-raporlama-sistemi)
    - [2.5. API Entegrasyonları](#25-api-entegrasyonları)
    - [2.6. Hata Yönetimi](#26-hata-yönetimi)
    - [2.7. Test Gereksinimleri](#27-test-gereksinimleri)
    - [2.8. Lastik Uzmanı Asistanı](#28-lastik-uzmanı-asistanı)
  - [3. Gelecek Modüller](#3-gelecek-modüller)

## 1. Genel Gereksinimler

### 1.1. Proje Kapsamı
LastikBende, yapay zeka destekli lastik analizi ve online lastik satışı yapan kapsamlı bir e-ticaret platformudur. Bu doküman, projenin genel gereksinimlerini ve analiz modülünün detaylı gereksinimlerini içermektedir.

### 1.2. Teknik Altyapı
- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express
- **Veritabanı**: PostgreSQL
- **Önbellek**: Redis
- **AI Servisleri**: Azure Computer Vision, OpenAI GPT-4o
- **Ödeme Sistemleri**: Iyzico
- **Deployment**: Docker, Kubernetes

### 1.3. Güvenlik Gereksinimleri
- KVKK ve GDPR uyumluluğu
- SSL/TLS şifreleme
- JWT tabanlı kimlik doğrulama
- API güvenliği ve rate limiting
- Veri şifreleme ve güvenli depolama
- Düzenli güvenlik denetimleri

### 1.4. Performans Gereksinimleri
- Sayfa yüklenme süresi: maksimum 2 saniye
- API yanıt süresi: maksimum 500ms
- Eşzamanlı kullanıcı desteği: minimum 1000
- Uptime: %99.9
- CDN kullanımı
- Önbellek stratejisi

### 1.5. Kullanıcı Arayüzü Gereksinimleri
- Responsive tasarım (mobil, tablet, masaüstü)
- Modern ve kullanıcı dostu arayüz
- Türkçe dil desteği (gelecekte çoklu dil desteği)
- Erişilebilirlik standartlarına uygunluk
- Yükleme göstergeleri ve geri bildirimler
- Hata mesajları ve kullanıcı yönlendirmeleri

## 2. Analiz Modülü Gereksinimleri

### 2.1. Form Bileşenleri
- **Lastik Tipi Seçimi**
  - Zorunlu alan
  - Önceden tanımlanmış lastik tipleri arasından seçim
  - Otomatik tamamlama özelliği
  - Geçersiz tip kontrolü
  
- **Marka Bilgisi**
  - Zorunlu alan
  - Otomatik doğrulama sistemi
  - Marka önerileri
  - Marka veritabanı entegrasyonu
  - Yeni marka ekleme özelliği
  
- **Model Bilgisi**
  - Opsiyonel alan
  - Seçilen markaya göre filtreleme
  - Model geçmişi
  - Model önerileri
  - Yeni model ekleme özelliği
  
- **Ebat Bilgisi**
  - Standart lastik ebat formatında giriş
  - Format doğrulama
  - Ebat veritabanı kontrolü
  - Otomatik ebat önerileri
  - Özel ebat girişi desteği
  
- **Üretim Yılı**
  - Zorunlu alan
  - 1900 ile günümüz yılı arasında değer kontrolü
  - Gelecek yıl lastikleri için +1 yıl tolerans
  - DOT kod kontrolü
  
- **Kilometre Bilgisi**
  - Opsiyonel alan
  - Sayısal değer kontrolü
  - Ortalama kullanım hesaplama
  - Kilometre bazlı öneriler

### 2.2. Görüntü İşleme Sistemi
- **Dosya Yükleme Özellikleri**
  - Desteklenen formatlar: JPG, PNG, WEBP
  - Maksimum dosya boyutu: 10MB
  - Önizleme özelliği
  - Sürükle-bırak desteği
  - Otomatik sıkıştırma
  - Görüntü kalitesi optimizasyonu
  
- **Lastik Tespit Sistemi**
  - Otomatik lastik tanıma
  - Görüntüde lastik varlığı kontrolü
  - Hatalı görüntü reddi
  - Lastik yönü tespiti
  - Lastik bölgesi izolasyonu
  - Görüntü düzeltme ve iyileştirme

### 2.3. Analiz Sistemi
- **Yapay Zeka Analizi**
  - Lastik durumu değerlendirmesi
  - Aşınma tespiti ve ölçümü
  - Hasar analizi ve sınıflandırma
  - Diş derinliği ölçümü
  - Lastik yaşı tespiti
  - DOT kod analizi
  - Lastik tipi doğrulama
  - Marka/model doğrulama
  
- **Sonuç Değerlendirmesi**
  - Güvenlik skoru hesaplama
  - Kullanım önerileri
  - Değişim gerekliliği değerlendirmesi
  - Maliyet tahmini
  - Karşılaştırmalı analiz
  - Risk değerlendirmesi
  - Yasal uygunluk kontrolü

### 2.4. Raporlama Sistemi
- **Analiz Raporu**
  - Lastik durumu özeti
  - Tespit edilen sorunlar ve seviyeleri
  - Detaylı öneriler
  - Güvenlik uyarıları
  - Teknik detaylar
  - Kullanım önerileri
  - Yasal uyarılar
  
- **Görsel Rapor**
  - PDF ve görsel formatında dışa aktarma

### 2.5. API Entegrasyonları
- **Analiz API'si**
  - Görüntü analizi
  - Lastik tespiti
  - Sonuç değerlendirmesi
  - Batch analiz desteği
  - Gerçek zamanlı analiz
  - Asenkron analiz
  - Webhook desteği
  
- **Doğrulama API'si**
  - Marka doğrulama
  - Model doğrulama
  - Ebat doğrulama
  - DOT kod doğrulama
  - Lastik tipi doğrulama
  - Veritabanı senkronizasyonu

### 2.6. Hata Yönetimi
- **Kullanıcı Hataları**
  - Form doğrulama hataları
  - Dosya yükleme hataları
  - Eksik alan uyarıları
  - Geçersiz veri uyarıları
  - Kullanıcı yönlendirmeleri
  - Hata düzeltme önerileri
  
- **Sistem Hataları**
  - Bağlantı hataları
  - Sunucu hataları
  - Analiz hataları
  - Hata loglama ve izleme
  - Otomatik hata raporlama
  - Hata kurtarma mekanizmaları
  - Yedek sistem entegrasyonu

### 2.7. Test Gereksinimleri
- **Birim Testleri**
  - Form doğrulama testleri
  - Görüntü işleme testleri
  - API entegrasyon testleri
  - Analiz algoritması testleri
  - Hata yönetimi testleri
  - Performans testleri
  
- **Kullanıcı Testleri**
  - Arayüz kullanılabilirlik testleri
  - Performans testleri
  - Yük testleri
  - Kullanıcı deneyimi testleri
  - A/B testleri
  - Beta testleri

### 2.8. Lastik Uzmanı Asistanı
- **Temel Özellikler**
  - Lastik uzmanı asistan arayüzü
  - Gerçek zamanlı sohbet deneyimi
  - Analiz sonuçları hakkında detaylı bilgi
  - Lastik bakımı ve güvenliği konusunda öneriler
  - Kullanıcı sorularına anlık yanıtlar
  
- **Teknik Özellikler**
  - OpenAI GPT-4o entegrasyonu
  - Sohbet geçmişi yönetimi (maksimum 50 mesaj)
  - Yazma animasyonu ve otomatik kaydırma
  - Mesaj formatlaması ve görselleştirme
  - Sürükle-bırak ile açılabilen sohbet penceresi
  - Mobil uyumlu tasarım
  
- **İçerik Özellikleri**
  - Lastik analiz sonuçları hakkında açıklamalar
  - Güvenlik değerlendirmesi hakkında bilgiler
  - Bakım ihtiyaçları ve öneriler
  - Tahmini ömür hesaplamaları
  - Sorun tespiti ve çözüm önerileri
  - Lastik değişim zamanı önerileri
  - Analiz raporu paylaşımı
  
- **Entegrasyon**
  - Analiz sonuçları ile entegrasyon
  - Form verileri ile entegrasyon
  - Raporlama sistemi ile entegrasyon
  - PDF dışa aktarma ile entegrasyon
  
- **Güvenlik ve Gizlilik**
  - Kullanıcı verilerinin korunması
  - Sohbet geçmişinin güvenli saklanması
  - KVKK ve GDPR uyumluluğu
  - Hassas bilgilerin filtrelenmesi

## 3. Gelecek Modüller

Modüller geliştirme aşamasındadır ve gereksinimleri ileride eklenecektir