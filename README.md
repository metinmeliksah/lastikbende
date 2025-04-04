# Lastik Bende

Lastik Bende - Lastik Satışı ve Analizi

## Proje Açıklaması

Lastik Bende, kullanıcıların lastik satın alabileceği ve lastik analizleri yapabileceği bir platformdur. Bu proje, TypeScript kullanılarak geliştirilmiştir ve modern web teknolojilerini kullanır.

## Kullanılan Teknolojiler

- **Next.js**: React tabanlı bir framework.
- **React**: Kullanıcı arayüzleri oluşturmak için kullanılan bir kütüphane.
- **TailwindCSS**: Yardımcı sınıflar kullanarak stil oluşturmayı sağlayan bir CSS framework.
- **Framer Motion**: Animasyonlar ve geçişler oluşturmak için kullanılan bir kütüphane.
- **TypeScript**: JavaScript'in üst kümesi olan ve statik tip kontrolü sağlayan bir dil.
- **OpenAI GPT-4**: Akıllı lastik uzmanı chatbot için kullanılan AI modeli.

## Özellikler

- Lastik satışı
- Lastik analizi
- Kullanıcı dostu arayüz
- **Akıllı Lastik Uzmanı Chat**:
  - GPT-4 tabanlı uzman asistan
  - Lastik analiz sonuçlarını değerlendirme
  - Kişiselleştirilmiş bakım önerileri
  - Markdown formatında zengin metin desteği
  - Gerçek zamanlı yazma animasyonları
  - Sınırsız sohbet geçmişi
  - Analiz raporlarını paylaşma ve yorumlama

## Kurulum

Projeyi yerel ortamınıza klonladıktan sonra, gerekli bağımlılıkları yüklemek için aşağıdaki adımları izleyin:

```bash
git clone https://github.com/metinmeliksah/lastikbende.git
cd lastikbende
npm install
```

### Çevre Değişkenleri

Projenin çalışması için aşağıdaki çevre değişkenlerini `.env.local` dosyasında tanımlamanız gerekmektedir:

```env
OPENAI_API_KEY=your_openai_api_key
AZURE_VISION_KEY=your_azure_vision_api_key
AZURE_VISION_ENDPOINT=your_azure_vision_endpoint
```

## Kullanım

Projeyi çalıştırmak için aşağıdaki komutu kullanın:

```bash
npm start
```

Geliştirme ortamında çalıştırmak için:

```bash
npm run dev
```

## Modüller

### 1. Chat Modülü

Chat modülü, kullanıcılara akıllı bir lastik uzmanı asistanı sunar. Özellikler:

- **Gerçek Zamanlı İletişim**: Anlık mesajlaşma ve yanıt alma
- **Analiz Entegrasyonu**: Lastik analiz sonuçlarını paylaşma ve yorumlama
- **Akıllı Öneriler**: GPT-4 tabanlı kişiselleştirilmiş bakım tavsiyeleri
- **Zengin Metin Desteği**: Markdown formatında formatlanmış yanıtlar
- **Animasyonlar**: Gerçekçi yazma animasyonları
- **Oturum Yönetimi**: 50 mesaja kadar sohbet geçmişi desteği

### 2. Analiz Modülü

Analiz modülü, lastiklerin yapay zeka destekli analizini ve raporlamasını sağlar. Özellikler:

- **Gelişmiş Lastik Analizi**:
  - Görüntü tabanlı lastik durumu değerlendirmesi
  - Azure Computer Vision ile yapay zeka destekli sorun tespiti
  - Güvenlik skoru hesaplama
  - Lastik ömür tahmini
  - Detaylı bakım ihtiyaçları analizi

- **Çoklu Format Raporlama**:
  - PDF formatında profesyonel raporlar (Puppeteer)
  - Excel formatında detaylı analiz tabloları (ExcelJS)
  - Word formatında özelleştirilmiş raporlar (Docx)
  - Özelleştirilmiş tasarım şablonları

- **Modüler Bileşen Yapısı**:
  - Form ve veri girişi bileşenleri
  - Görüntü yükleme ve önizleme
  - Analiz sonuçları görüntüleme
  - Güvenlik değerlendirme paneli
  - Bakım tavsiyeleri bölümü
  - Rapor oluşturma arayüzü

- **API Servisleri**:
  - `/analiz/api/analyze`: Lastik analizi endpoint'i
  - `/analiz/api/export/*`: PDF, Excel ve Word rapor oluşturma
  - `/analiz/api/validate`: Form doğrulama servisi

- **Performans Optimizasyonları**:
  - Görüntü optimizasyonu
  - API önbellekleme
  - Asenkron rapor oluşturma
  - Kademeli yükleme desteği

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen önce bir konu açın ve neyi değiştirmek veya eklemek istediğinizi açıklayın. Daha sonra bir pull request oluşturabilirsiniz.

## Lisans

MIT Lisansı

Telif Hakkı (c) 2025 Lastik Bende Projesi Sahipleri

İşbu belgeyle, bu yazılımın ve ilgili dokümantasyon dosyalarının (bundan böyle "Yazılım" olarak anılacaktır) bir kopyasını edinmiş olan kişilere, Yazılım'ı sınırlama olmaksızın kullanma, kopyalama, değiştirme, birleştirme, yayınlama, dağıtma, alt lisanslama ve/veya Yazılım'ın kopyalarını satma izni ücretsiz olarak verilmektedir ve bu kişilere aşağıdaki koşullara tabi olarak Yazılım'ın sağlandığı kişilere aynı izni verme izni verilmektedir:

Yukarıdaki telif hakkı bildirimi ve bu izin bildirimi, Yazılım'ın tüm kopyalarına veya önemli bölümlerine dahil edilecektir.

YAZILIM, "OLDUĞU GİBİ", HERHANGİ BİR GARANTİ OLMAKSIZIN SAĞLANMAKTADIR; AÇIK VEYA ZIMNİ HERHANGİ BİR GARANTİ DAHİL OLMAKSIZIN, ANCAK BUNLARLA SINIRLI OLMAMAK ÜZERE TİCARİ ELVERİŞLİLİK, BELİRLİ BİR AMACA UYGUNLUK VE İHLAL ETMEME GARANTİLERİ DAHİL OLMAK ÜZERE. HİÇBİR DURUMDA YAZARLAR VEYA TELİF HAKKI SAHİPLERİ, YAZILIM İLE İLGİLİ OLARAK VEYA YAZILIM'IN KULLANIMI VEYA DİĞER İLGİLİ İŞLEMLERDEN DOĞAN HERHANGİ BİR İDDİA, HASAR VEYA DİĞER YÜKÜMLÜLÜKLERDEN SORUMLU DEĞİLDİR.
