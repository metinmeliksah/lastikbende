# Veritabanı Dokümantasyonu

## Genel Bakış

LastikBende platformu, PostgreSQL veritabanı kullanmaktadır. Veritabanı şeması, lastik analizi, e-ticaret, kullanıcı yönetimi ve raporlama işlevlerini desteklemek için tasarlanmıştır.

## Veritabanı Mimarisi

### Ana Tablolar

1. **users**
   - Kullanıcı bilgileri ve kimlik doğrulama
   - Rol tabanlı yetkilendirme
   - Profil bilgileri

2. **tires**
   - Lastik ürün bilgileri
   - Stok yönetimi
   - Fiyatlandırma

3. **analysis**
   - Lastik analiz sonuçları
   - Görüntü işleme verileri
   - Analiz geçmişi

4. **orders**
   - Sipariş bilgileri
   - Ödeme detayları
   - Teslimat bilgileri

5. **maintenance**
   - Bakım hatırlatıcıları
   - Servis kayıtları
   - Performans metrikleri

### İlişkisel Tablolar

1. **user_tires**
   - Kullanıcı-lastik ilişkileri
   - Kullanım geçmişi
   - Bakım kayıtları

2. **tire_reviews**
   - Lastik değerlendirmeleri
   - Kullanıcı yorumları
   - Puanlama sistemi

3. **order_items**
   - Sipariş kalemleri
   - Ürün detayları
   - Fiyat bilgileri

## Veritabanı Şeması

### Users Tablosu
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'analyst', 'manager'))
);
```

### Tires Tablosu
```sql
CREATE TABLE tires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    season VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    specifications JSONB NOT NULL,
    features TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT valid_season CHECK (season IN ('summer', 'winter', 'all_season')),
    CONSTRAINT valid_size CHECK (size ~ '^\d{3}/\d{2}[A-Z]\d{2}$')
);
```

### Analysis Tablosu
```sql
CREATE TABLE analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tire_id UUID REFERENCES tires(id),
    image_url TEXT NOT NULL,
    form_data JSONB NOT NULL,
    results JSONB NOT NULL,
    security_score INTEGER NOT NULL,
    remaining_life INTEGER NOT NULL,
    tread_depth DECIMAL(5,2) NOT NULL,
    wear_rate DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    CONSTRAINT valid_security_score CHECK (security_score BETWEEN 0 AND 100),
    CONSTRAINT valid_remaining_life CHECK (remaining_life BETWEEN 0 AND 100)
);
```

### Orders Tablosu
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    shipping_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT valid_shipping_status CHECK (shipping_status IN ('pending', 'processing', 'shipped', 'delivered'))
);
```

### Maintenance Tablosu
```sql
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tire_id UUID REFERENCES tires(id),
    reminder_type VARCHAR(50) NOT NULL,
    installation_date DATE NOT NULL,
    expected_lifespan INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    reminder_date DATE NOT NULL,
    notification_preferences JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_reminder_type CHECK (reminder_type IN ('rotation', 'pressure', 'alignment', 'replacement')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled'))
);
```

## Veritabanı İndeksleri

### Performans İndeksleri
```sql
-- Users tablosu için indeksler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Tires tablosu için indeksler
CREATE INDEX idx_tires_brand ON tires(brand);
CREATE INDEX idx_tires_model ON tires(model);
CREATE INDEX idx_tires_size ON tires(size);
CREATE INDEX idx_tires_season ON tires(season);
CREATE INDEX idx_tires_price ON tires(price);

-- Analysis tablosu için indeksler
CREATE INDEX idx_analysis_user_id ON analysis(user_id);
CREATE INDEX idx_analysis_tire_id ON analysis(tire_id);
CREATE INDEX idx_analysis_created_at ON analysis(created_at);
CREATE INDEX idx_analysis_security_score ON analysis(security_score);

-- Orders tablosu için indeksler
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Maintenance tablosu için indeksler
CREATE INDEX idx_maintenance_user_id ON maintenance(user_id);
CREATE INDEX idx_maintenance_tire_id ON maintenance(tire_id);
CREATE INDEX idx_maintenance_reminder_date ON maintenance(reminder_date);
CREATE INDEX idx_maintenance_status ON maintenance(status);
```

### Tam Metin Arama İndeksleri
```sql
-- Tires tablosu için tam metin arama indeksi
CREATE INDEX idx_tires_text_search ON tires 
USING gin(to_tsvector('turkish', brand || ' ' || model || ' ' || size));

-- Analysis tablosu için tam metin arama indeksi
CREATE INDEX idx_analysis_text_search ON analysis 
USING gin(to_tsvector('turkish', form_data::text));
```

## Veritabanı Yedekleme ve Kurtarma

### Yedekleme Stratejisi

1. **Tam Yedekleme**
   - Her gün gece yarısı
   - 30 gün saklama süresi
   - Sıkıştırılmış format
   - Şifrelenmiş depolama

2. **Artımlı Yedekleme**
   - Her saat başı
   - 7 gün saklama süresi
   - WAL (Write-Ahead Log) yedekleme
   - Sürekli yedekleme

3. **Yedekleme Doğrulama**
   - Otomatik yedek doğrulama
   - Yedek bütünlük kontrolü
   - Yedek performans testi
   - Yedek erişilebilirlik kontrolü

### Kurtarma Prosedürleri

1. **Tam Kurtarma**
   ```bash
   # Tam yedekten kurtarma
   pg_restore -d lastikbende -v backup.dump
   
   # WAL dosyalarından kurtarma
   pg_ctl -D /var/lib/postgresql/data start -w
   ```

2. **Point-in-Time Kurtarma**
   ```bash
   # Belirli bir zaman noktasına kurtarma
   pg_restore -d lastikbende -v --clean --if-exists backup.dump
   ```

3. **Veritabanı Klonlama**
   ```bash
   # Veritabanı klonlama
   pg_dump -Fc lastikbende > backup.dump
   createdb lastikbende_clone
   pg_restore -d lastikbende_clone backup.dump
   ```

## Veritabanı Bakımı

### Rutin Bakım İşlemleri

1. **VACUUM ve ANALYZE**
   ```sql
   -- Otomatik VACUUM ayarları
   ALTER SYSTEM SET autovacuum = on;
   ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
   ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;
   
   -- Manuel VACUUM ve ANALYZE
   VACUUM ANALYZE users;
   VACUUM ANALYZE tires;
   VACUUM ANALYZE analysis;
   VACUUM ANALYZE orders;
   VACUUM ANALYZE maintenance;
   ```

2. **İndeks Bakımı**
   ```sql
   -- İndeks yeniden oluşturma
   REINDEX TABLE users;
   REINDEX TABLE tires;
   REINDEX TABLE analysis;
   REINDEX TABLE orders;
   REINDEX TABLE maintenance;
   ```

3. **İstatistik Güncelleme**
   ```sql
   -- İstatistik güncelleme
   ANALYZE users;
   ANALYZE tires;
   ANALYZE analysis;
   ANALYZE orders;
   ANALYZE maintenance;
   ```

### Performans İzleme

1. **Sorgu Performansı**
   ```sql
   -- Yavaş sorguları izleme
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Tablo İstatistikleri**
   ```sql
   -- Tablo boyutları
   SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
   FROM pg_catalog.pg_statio_user_tables
   ORDER BY pg_total_relation_size(relid) DESC;
   ```

3. **İndeks Kullanımı**
   ```sql
   -- İndeks kullanım istatistikleri
   SELECT schemaname, relname, idx_scan, idx_tup_read, idx_tup_fetch
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   ```

## Veritabanı Güvenliği

### Erişim Kontrolü

1. **Kullanıcı Yetkilendirme**
   ```sql
   -- Veritabanı kullanıcısı oluşturma
   CREATE USER lastikbende_app WITH PASSWORD 'strong_password';
   
   -- Yetki verme
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lastikbende_app;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lastikbende_app;
   ```

2. **Rol Tabanlı Erişim**
   ```sql
   -- Rol oluşturma
   CREATE ROLE read_only;
   CREATE ROLE write_only;
   
   -- Rol yetkileri
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;
   GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO write_only;
   ```

### Veri Şifreleme

1. **Hassas Veri Şifreleme**
   ```sql
   -- Şifreleme fonksiyonu
   CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
   RETURNS TEXT AS $$
   BEGIN
     RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Şifre çözme fonksiyonu
   CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
   RETURNS TEXT AS $$
   BEGIN
     RETURN pgp_sym_decrypt(encrypted_data::bytea, current_setting('app.encryption_key'));
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **Şifreli Sütunlar**
   ```sql
   -- Şifreli sütun ekleme
   ALTER TABLE users ADD COLUMN encrypted_phone TEXT;
   
   -- Veri şifreleme
   UPDATE users SET encrypted_phone = encrypt_sensitive_data(phone);
   ```

### Denetim İzi (Audit Trail)

1. **Denetim Tablosu**
   ```sql
   CREATE TABLE audit_logs (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       table_name VARCHAR(100) NOT NULL,
       record_id UUID NOT NULL,
       action VARCHAR(50) NOT NULL,
       old_data JSONB,
       new_data JSONB,
       user_id UUID REFERENCES users(id),
       ip_address INET,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Denetim Tetikleyicisi**
   ```sql
   CREATE OR REPLACE FUNCTION audit_trigger_function()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO audit_logs (
           table_name,
           record_id,
           action,
           old_data,
           new_data,
           user_id,
           ip_address
       )
       VALUES (
           TG_TABLE_NAME,
           COALESCE(NEW.id, OLD.id),
           TG_OP,
           CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
           CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
           current_setting('app.current_user_id')::UUID,
           current_setting('app.client_ip')::INET
       );
       RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;
   ```

## Veritabanı Performans Optimizasyonu

### Sorgu Optimizasyonu

1. **İndeks Kullanımı**
   ```sql
   -- Karmaşık sorgular için bileşik indeks
   CREATE INDEX idx_tires_search ON tires (brand, model, size, season);
   
   -- Kısmi indeks
   CREATE INDEX idx_active_tires ON tires (brand, model)
   WHERE is_active = true;
   ```

2. **Materialized View**
   ```sql
   -- Sık kullanılan sorgular için materialized view
   CREATE MATERIALIZED VIEW mv_tire_stats AS
   SELECT 
       brand,
       model,
       COUNT(*) as total_count,
       AVG(price) as avg_price,
       MIN(price) as min_price,
       MAX(price) as max_price
   FROM tires
   GROUP BY brand, model;
   
   -- Materialized view yenileme
   REFRESH MATERIALIZED VIEW mv_tire_stats;
   ```

### Bağlantı Havuzu

1. **PgBouncer Yapılandırması**
   ```ini
   [databases]
   lastikbende = host=127.0.0.1 port=5432 dbname=lastikbende
   
   [pgbouncer]
   listen_port = 6432
   listen_addr = 127.0.0.1
   auth_type = md5
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 20
   ```

2. **Bağlantı Havuzu İzleme**
   ```sql
   -- Aktif bağlantıları izleme
   SELECT * FROM pg_stat_activity;
   
   -- Bağlantı havuzu istatistikleri
   SELECT * FROM pg_stat_database;
   ```

## Veritabanı Yönetim Araçları

### pgAdmin 4
- Veritabanı yönetimi
- Sorgu editörü
- Performans izleme
- Yedekleme ve kurtarma

### pgMetrics
- Sistem metrikleri
- Performans izleme
- Kaynak kullanımı
- Uyarı sistemi

### pgBadger
- Sorgu analizi
- Performans raporları
- Hata izleme
- Kullanım istatistikleri

## Veritabanı Geliştirme Ortamı

### Yerel Geliştirme
```bash
# Docker ile PostgreSQL başlatma
docker run -d \
  --name lastikbende-db \
  -e POSTGRES_DB=lastikbende \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:14

# Veritabanı şemasını oluşturma
psql -h localhost -U dev -d lastikbende -f schema.sql

# Test verilerini yükleme
psql -h localhost -U dev -d lastikbende -f seed.sql
```

### Test Ortamı
```bash
# Test veritabanı oluşturma
createdb lastikbende_test

# Test şemasını yükleme
psql -d lastikbende_test -f schema.sql

# Test verilerini yükleme
psql -d lastikbende_test -f test_data.sql
```

### CI/CD Entegrasyonu
```yaml
# GitHub Actions workflow örneği
name: Database Migration

on:
  push:
    branches: [ main ]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Migrations
        run: |
          psql -h ${{ secrets.DB_HOST }} \
               -U ${{ secrets.DB_USER }} \
               -d ${{ secrets.DB_NAME }} \
               -f migrations/up.sql
```

## Veritabanı Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **Bağlantı Sorunları**
   ```sql
   -- Aktif bağlantıları kontrol etme
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   
   -- Uzun süren sorguları sonlandırma
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active'
   AND query NOT ILIKE '%pg_stat_activity%'
   AND pid <> pg_backend_pid();
   ```

2. **Performans Sorunları**
   ```sql
   -- Yavaş sorguları tespit etme
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   WHERE mean_time > 1000
   ORDER BY mean_time DESC;
   
   -- Tablo ve indeks boyutlarını kontrol etme
   SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
   FROM pg_catalog.pg_statio_user_tables
   ORDER BY pg_total_relation_size(relid) DESC;
   ```

3. **Veri Tutarsızlığı**
   ```sql
   -- Veri tutarsızlıklarını kontrol etme
   SELECT t.id, t.brand, t.model, COUNT(*) as duplicate_count
   FROM tires t
   GROUP BY t.id, t.brand, t.model
   HAVING COUNT(*) > 1;
   
   -- Tutarsız verileri düzeltme
   WITH duplicates AS (
     SELECT id, MIN(ctid) as min_ctid
     FROM tires
     GROUP BY id
     HAVING COUNT(*) > 1
   )
   DELETE FROM tires
   WHERE ctid NOT IN (
     SELECT min_ctid
     FROM duplicates
   );
   ```

### Veritabanı Bakım Kontrol Listesi

1. **Günlük Kontroller**
   - [ ] Aktif bağlantı sayısı
   - [ ] Disk kullanımı
   - [ ] Yavaş sorgular
   - [ ] Hata logları

2. **Haftalık Kontroller**
   - [ ] VACUUM ve ANALYZE
   - [ ] İndeks kullanımı
   - [ ] Tablo boyutları
   - [ ] Performans metrikleri

3. **Aylık Kontroller**
   - [ ] Tam yedekleme
   - [ ] İndeks yeniden oluşturma
   - [ ] İstatistik güncelleme
   - [ ] Güvenlik denetimi 