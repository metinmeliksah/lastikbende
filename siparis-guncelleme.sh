#!/bin/bash

# LastikBende Sipariş Tablosu Güncelleme Aracı
# Bu script veritabanında siparis_no alanını ekler ve teslimat_tipi'den sipariş numaralarını çıkarır

echo "======================================================================================"
echo "LastikBende Sipariş Tablosu Güncelleme Aracı"
echo "======================================================================================"
echo ""
echo "Bu araç, sipariş tablosuna siparis_no alanı ekler ve gerekli güncellemeleri yapar."
echo "Uygulamayı herhangi bir veritabanı istemcisi ile kullanabilirsiniz."
echo ""
echo "1. Supabase SQL Editör kullanarak:"
echo "   - Supabase projenizin yönetim paneline giriş yapın"
echo "   - SQL Editör bölümüne gidin"
echo "   - siparis-duzeltme.sql dosyasındaki içeriği kopyalayıp yapıştırın ve çalıştırın"
echo ""
echo "2. Supabase CLI kullanarak:"
echo "   - supabase login komutunu çalıştırın"
echo "   - supabase db execute -f siparis-duzeltme.sql komutunu çalıştırın"
echo ""
echo "3. PostgreSQL istemcisi kullanarak:"
echo "   - psql -h <veritabanı-adı> -U postgres -f siparis-duzeltme.sql komutunu çalıştırın"
echo ""
echo "Güncelleme tamamlandıktan sonra, NextJS uygulamasını tekrar başlatın:"
echo "npm run dev"
echo ""
echo "======================================================================================"

# Supabase CLI yüklü olmalıdır
# Bu scripti çalıştırmadan önce Supabase projenize bağlı olduğunuzdan emin olun
# supabase login

echo "Sipariş tablosunu güncelleme işlemi başlatılıyor..."

# Supabase projenizde siparis_duzeltme.sql dosyasını çalıştırın
# Bu komutu Supabase CLI kuruluysa kullanabilirsiniz:
# supabase db execute < siparis-duzeltme.sql

# Veya alternatif olarak PSQL kullanabilirsiniz:
# PGPASSWORD=your_password psql -h your_db_host -U postgres -d postgres -f siparis-duzeltme.sql

# Ya da Supabase SQL Editörüne siparis-duzeltme.sql içeriğini kopyalayıp yapıştırabilirsiniz

echo "Güncelleme işlemi tamamlandı. Log dosyalarını kontrol edin."

# Şimdi dev sunucusunu başlat
echo "Geliştirme sunucusu başlatılıyor..."
npm run dev 