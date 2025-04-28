# Analizlerim Sayfası

## Genel Bakış
Analizlerim sayfası, oturum açmış kullanıcının daha önce gerçekleştirdiği lastik analizlerini listeleyen ve yönetim imkanı sunan bir Next.js bileşenidir. Supabase kimlik doğrulama ile kullanıcı verisi güvenli bir şekilde alınır ve React Query ile önbelleğe alınır.

## Öne Çıkan Özellikler
- Kullanıcıya ait analizleri listeleme
- Arama: Marka, model, ebat, tarih veya analiz ID ile arama
- Filtreleme: Tarihe veya markaya göre sıralama
- Tarih aralığı seçimi ile gelişmiş filtreleme
- Yükleme ve hata durumları için kullanıcı dostu geri bildirim (skeleton, hata mesajı)
- Animasyonlu geçişler için Framer Motion kullanımı

## Teknolojiler ve Kütüphaneler
- Next.js App Router & React
- Supabase (Auth & Veri)
- React Query (Veri Yönetimi)
- Framer Motion (Animasyon)
- React Icons (İkonlar)
- Tailwind CSS (Stil)
- TypeScript

## Veri Alma (Data Fetching)
`fetchAnalyses()` fonksiyonu, Supabase oturum bilgisini alır ve analiz verilerini çeker:
```ts
const { data: { session } } = await supabase.auth.getSession();
const { data, error } = await supabase
  .from('analyses')
  .select('id, created_at, marka, model, ebat, image_url')
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false });
```

## Durum Yönetimi ve Görüntüleme
- **Loading**: Skeleton kartlarla yükleme durumu gösterilir
- **Error**: Hata mesajı ve "Tekrar Dene" butonu
- **Success**: Filtrelenmiş analiz kartları gridi

## Bileşen Yapısı
- `AnalizlerimPage` (`page.tsx`): Ana sayfa bileşeni
- `AnalizlerimContent`: Listeleme, filtre ve arama mantığı
- `AnalysisCard`: Her bir analiz öğesinin görsel kart bileşeni
- Inline FilterPanel: Sıralama ve tarih aralığı filtreleme UI

## Dosya Yapısı
```
app/analizlerim/
├── [id]/         # Tekil analiz detay sayfası
├── page.tsx      # Listeleme sayfası bileşeni
└── README.md     # Bu doküman
```

## Nasıl Kullanılır
1. `/analizlerim` yoluna gidin.
2. Arama çubuğuna anahtar kelime girin.
3. "Filtrele" butonundan sıralama veya tarih aralığı seçin.
4. Analiz kartına tıklayarak detay sayfasına yönelin.

## İpuçları
- Performans için React Query `staleTime` ve `gcTime` ayarlarını inceleyin
- Filtre mantığı `useState` ve `filter` fonksiyonuna dayanır
- Tasarım için Tailwind CSS sınıflarını özelleştirebilirsiniz 