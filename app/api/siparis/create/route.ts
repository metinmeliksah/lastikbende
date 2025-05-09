import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // CORS ve response headers için genel ayarlar
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // OPTIONS isteği için yanıt ver (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    console.log('Sipariş API başladı');
    
    // Request body'yi hemen alalım
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Alınan istek verisi:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('Request parse hatası:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Geçersiz istek formatı'
      }, {
        status: 400,
        headers
      });
    }
    
    const {
      teslimatTipi,
      teslimatAdresiId,
      faturaAdresiId,
      montajBilgisi,
      magazaId,
      urunler,
      odemeBilgisi
    } = requestBody;
    
    // Tüm değerleri kontrol et
    console.log('Değer kontrolü:');
    console.log('- teslimatTipi:', teslimatTipi);
    console.log('- teslimatAdresiId:', teslimatAdresiId);
    console.log('- faturaAdresiId:', faturaAdresiId);
    console.log('- montajBilgisi:', montajBilgisi);
    console.log('- magazaId:', magazaId);
    console.log('- urunler length:', urunler?.length);
    console.log('- odemeBilgisi:', odemeBilgisi);
    
    // Zorunlu alanları kontrol et
    if (!teslimatTipi || !odemeBilgisi || !urunler) {
      console.error('Eksik bilgi:', {
        teslimatTipi: !!teslimatTipi,
        odemeBilgisi: !!odemeBilgisi,
        urunler: !!urunler
      });
      return NextResponse.json({
        success: false,
        error: 'Eksik bilgi gönderildi. Lütfen tüm alanları doldurun.'
      }, {
        status: 400,
        headers
      });
    }
    
    // Sipariş numarası oluştur (Örnek: SIP-20240425-001)
    const siparisNo = `SIP-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    console.log('Sipariş numarası oluşturuldu:', siparisNo);
    
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Kullanıcı oturumunu kontrol et - hem getSession hem getUser ile dene
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      
      // Eğer session yoksa getUser ile deneyelim
      if (!userId) {
        console.log('Session bulunamadı, getUser ile deneniyor...');
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      console.log('Oturum user ID:', userId);
      
      // Debug için tüm cookie'leri kontrol et
      console.log('Mevcut cookiler:', cookieStore.getAll().map(c => c.name));
      
      // Oturumlar için son kontrol
      if (!userId) {
        console.warn('Kullanıcı oturumu bulunamadı, misafir olarak devam ediliyor');
        // Eğer misafir siparişleri kabul ediliyorsa bu kısmı kullanabilirsiniz
        // Şimdilik otomatik bir test ID atıyoruz
        userId = 'misafir-' + Date.now();
      }
      
      // Sipariş oluşturmaya çalış
      try {
        console.log('Sipariş oluşturuluyor...');
        
        // Ödeme bilgisinin doğru formatta olduğunu kontrol et
        if (!odemeBilgisi || !odemeBilgisi.yontem) {
          console.error('Ödeme bilgisi geçersiz:', odemeBilgisi);
          return NextResponse.json({
            success: false,
            error: 'Ödeme bilgisi eksik veya geçersiz'
          }, {
            status: 400,
            headers
          });
        }
        
        const odemeBilgisiObj = {
          yontem: odemeBilgisi.yontem,
          durum: 'onaylandi',
          referans_no: odemeBilgisi.referansNo || `REF-${Date.now()}`,
          tutar: odemeBilgisi.tutar || 0,
          odeme_tarihi: new Date().toISOString()
        };
        
        console.log('Ödeme bilgisi:', JSON.stringify(odemeBilgisiObj, null, 2));
        
        const siparisData = {
          user_id: userId,
          teslimat_tipi: teslimatTipi,
          teslimat_adres_id: teslimatTipi === 'adres' ? teslimatAdresiId : null,
          fatura_adres_id: faturaAdresiId,
          magaza_id: teslimatTipi === 'magaza' ? magazaId : null,
          montaj_bilgisi: teslimatTipi === 'magaza' ? montajBilgisi : null,
          montaj_bayi_id: teslimatTipi === 'magaza' ? magazaId : null,
          montaj_tarihi: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.tarih : null,
          montaj_saati: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.saat : null,
          montaj_notu: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.not : null,
          odeme_bilgisi: odemeBilgisiObj,
          durum: 'hazırlanıyor',
          siparis_durumu: 'siparis_alindi',
          toplam_tutar: odemeBilgisi.tutar || 0,
          kargo_ucreti: 0,
          genel_toplam: odemeBilgisi.tutar || 0,
          siparis_tarihi: new Date().toISOString(),
          guncelleme_tarihi: new Date().toISOString()
        };
        
        console.log('Sipariş verileri:', JSON.stringify(siparisData, null, 2));
        
        const { data: siparisResult, error: siparisError } = await supabase
          .from('siparis')
          .insert(siparisData)
          .select()
          .single();
          
        if (siparisError) {
          console.error('Sipariş oluşturma hatası:', siparisError);
          return NextResponse.json({
            success: false,
            error: 'Sipariş oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ' + siparisError.message
          }, {
            status: 500,
            headers
          });
        }
        
        // Sipariş oluştu mu kontrol edelim
        if (!siparisResult) {
          console.error('Sipariş verisi dönmedi');
          return NextResponse.json({
            success: false,
            error: 'Sipariş oluşturuldu ancak verisi alınamadı'
          }, {
            status: 500,
            headers
          });
        }
        
        console.log('Sipariş başarıyla oluşturuldu, ID:', siparisResult.id);
        
        // Sipariş ürünlerini ekle
        if (urunler && urunler.length > 0 && siparisResult) {
          console.log('Sipariş ürünleri ekleniyor...');
          
          const siparisUrunleri = urunler.map((urun: any) => ({
            siparis_id: siparisResult.id,
            stok_id: urun.stok_id,
            adet: urun.adet,
            fiyat: urun.fiyat
          }));
          
          console.log('Sipariş ürünleri verileri:', JSON.stringify(siparisUrunleri, null, 2));
          
          const { error: urunlerError } = await supabase
            .from('siparis_urunleri')
            .insert(siparisUrunleri);
            
          if (urunlerError) {
            console.error('Sipariş ürünleri eklenirken hata:', urunlerError);
            return NextResponse.json({
              success: false,
              error: 'Sipariş ürünleri eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ' + urunlerError.message
            }, {
              status: 500,
              headers
            });
          }
          
          console.log('Sipariş ürünleri başarıyla eklendi');
        } else {
          console.warn('Eklenecek sipariş ürünü bulunamadı');
        }
          
        console.log('Sipariş işlemi başarıyla tamamlandı');
        return NextResponse.json({
          success: true,
          message: 'Sipariş başarıyla oluşturuldu',
          siparisNo: siparisNo
        }, {
          headers
        });
      } catch (dbError: any) {
        console.error('Veritabanı hatası:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Siparişiniz veritabanına kaydedilemedi. Lütfen daha sonra tekrar deneyin. Hata: ' + (dbError.message || 'Bilinmeyen veritabanı hatası')
        }, {
          status: 500,
          headers
        });
      }
    } catch (error: any) {
      console.error('Genel hata:', error);
      return NextResponse.json({
        success: false,
        error: 'Sunucu hatası. Siparişiniz işlenirken bir sorun oluştu. Hata: ' + (error.message || 'Bilinmeyen hata')
      }, {
        status: 500,
        headers
      });
    }
  } catch (error: any) {
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json({
      success: false,
      error: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ' + (error.message || 'Bilinmeyen hata')
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 