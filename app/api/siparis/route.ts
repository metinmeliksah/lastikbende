import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// CORS headers function to standardize headers across all responses
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-From-Page'
  };
}

// Helper to get user id from Supabase session
async function getUserIdFromRequest() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

export async function POST(request: NextRequest) {
  // Get standard CORS headers
  const headers = getCorsHeaders();

  // OPTIONS isteği için yanıt ver (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Oturum kontrolü başarısız. Lütfen giriş yapınız.' }, 
      { status: 401, headers }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    console.log('Alınan istek:', JSON.stringify(body, null, 2));

    // Ödeme bilgisi formatını kontrol et ve düzenle
    const odemeBilgisi = {
      yontem: body.odemeYontemi || 'bank-transfer',
      durum: 'onaylandi',
      referans_no: `REF-${Date.now()}`,
      tutar: body.genelToplam || 0,
      odeme_tarihi: new Date().toISOString()
    };

    // Sipariş numarası oluştur - daha güvenilir format
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const siparisNo = body.siparisNo || `SIP-${timestamp}-${randomPart}`;

    // Sipariş verilerini kaydet
    let { data: siparis, error: siparisError } = await supabase
      .from('siparis')
      .insert({
        user_id: userId,
        teslimat_tipi: body.teslimatBilgileri.tip,
        teslimat_adres_id: body.teslimatBilgileri.tip === 'adres' ? body.teslimatBilgileri.teslimatAdresi?.id : null,
        fatura_adres_id: body.faturaAdresi.id,
        magaza_id: body.teslimatBilgileri.tip === 'magaza' ? body.teslimatBilgileri.magaza?.id : null,
        montaj_bilgisi: body.teslimatBilgileri.tip === 'magaza' ? body.teslimatBilgileri.montajBilgisi : null,
        toplam_tutar: body.toplamTutar || 0,
        kargo_ucreti: body.kargoUcreti || 0,
        genel_toplam: body.genelToplam || 0,
        durum: body.durum || 'hazırlanıyor',
        odeme_bilgisi: odemeBilgisi,
        siparis_durumu: 'siparis_alindi',
        siparis_tarihi: new Date().toISOString(),
        guncelleme_tarihi: new Date().toISOString(),
        siparis_no: siparisNo
      })
      .select()
      .single();

    if (siparisError) {
      console.error('Sipariş oluşturma hatası:', siparisError);
      
      // Siparis_no alanı eksikse fallback olarak teslimat_tipi alanını kullan
      if (siparisError.message && siparisError.message.includes('siparis_no')) {
        console.log('siparis_no alanı eksik, alternatif yönteme geçiliyor');
        
        const { data: siparisFallback, error: fallbackError } = await supabase
          .from('siparis')
          .insert({
            user_id: userId,
            teslimat_tipi: `${body.teslimatBilgileri.tip}_${siparisNo}`, // Sipariş numarasını teslimat_tipi'ye ekle
            teslimat_adres_id: body.teslimatBilgileri.tip === 'adres' ? body.teslimatBilgileri.teslimatAdresi?.id : null,
            fatura_adres_id: body.faturaAdresi.id,
            magaza_id: body.teslimatBilgileri.tip === 'magaza' ? body.teslimatBilgileri.magaza?.id : null,
            montaj_bilgisi: body.teslimatBilgileri.tip === 'magaza' ? body.teslimatBilgileri.montajBilgisi : null,
            toplam_tutar: body.toplamTutar || 0,
            kargo_ucreti: body.kargoUcreti || 0,
            genel_toplam: body.genelToplam || 0,
            durum: body.durum || 'hazırlanıyor',
            odeme_bilgisi: odemeBilgisi,
            siparis_durumu: 'siparis_alindi',
            siparis_tarihi: new Date().toISOString(),
            guncelleme_tarihi: new Date().toISOString()
          })
          .select()
          .single();
          
        if (fallbackError) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Sipariş oluşturulurken hata oluştu', 
              message: fallbackError.message 
            }, 
            { status: 500, headers }
          );
        }
        
        // Başarılı fallback
        console.log('Alternatif yöntemle sipariş oluşturuldu');
        siparis = siparisFallback;
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Sipariş oluşturulurken hata oluştu', 
            message: siparisError.message 
          }, 
          { status: 500, headers }
        );
      }
    }

    if (!siparis) {
      console.error('Sipariş verisi dönmedi');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sipariş verisi döndürülemedi' 
        }, 
        { status: 500, headers }
      );
    }

    // Sipariş ürünlerini kaydet
    if (body.urunler && body.urunler.length > 0) {
      const siparisUrunleri = body.urunler.map((urun: any) => ({
        siparis_id: siparis.id,
        stok_id: urun.id,
        adet: urun.adet,
        fiyat: urun.fiyat
      }));

      const { error: urunlerError } = await supabase
        .from('siparis_urunleri')
        .insert(siparisUrunleri);

      if (urunlerError) {
        console.error('Sipariş ürünleri ekleme hatası:', urunlerError);
        // Ürün ekleme hatası olursa bile sipariş oluşturulduğunu bildirelim
        return NextResponse.json({
          success: true,
          warning: 'Sipariş oluşturuldu ancak ürünler eklenirken hata oluştu',
          message: 'Sipariş başarıyla oluşturuldu',
          siparisNo: siparisNo
        }, { headers });
      }
    } else {
      console.warn('Eklenecek ürün bulunamadı');
    }

    return NextResponse.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      siparisNo: siparisNo
    }, { headers });

  } catch (error: any) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sipariş oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') 
      },
      { status: 500, headers }
    );
  }
}

// Sipariş durumunu güncelle
export async function PUT(request: NextRequest) {
  // Get standard CORS headers  
  const headers = getCorsHeaders();

  // OPTIONS isteği için yanıt ver (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401, headers }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Sipariş No ile değil ID ile sorgulama yapmalıyız
    // Önce sipariş ID'sini bulalım
    const { data: siparis, error: findError } = await supabase
      .from('siparis')
      .select('id')
      .eq('id', body.siparisId) // siparisNo yerine siparisId kullanılmalı
      .eq('user_id', userId)
      .single();

    if (findError) {
      console.error('Sipariş bulunamadı:', findError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sipariş bulunamadı veya bu işlem için yetkiniz yok', 
          message: findError.message 
        }, 
        { status: 404, headers }
      );
    }

    if (!siparis) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404, headers }
      );
    }

    const { error } = await supabase
      .from('siparis')
      .update({ durum: body.durum })
      .eq('id', siparis.id);

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sipariş durumu güncellenirken hata oluştu', 
          message: error.message 
        }, 
        { status: 500, headers }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sipariş durumu güncellendi'
    }, { headers });

  } catch (error: any) {
    console.error('Sipariş güncelleme hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sipariş güncellenirken bir hata oluştu',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500, headers }
    );
  }
}

// Sipariş detaylarını getir
export async function GET(request: NextRequest) {
  // Get standard CORS headers
  const headers = getCorsHeaders();

  // OPTIONS isteği için yanıt ver (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const siparisId = searchParams.get('siparisId');
    
    if (!siparisId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sipariş ID bulunamadı.' 
      }, { 
        status: 400,
        headers
      });
    }
    
    console.log('API: Sipariş sorgulanıyor, ID:', siparisId);
    
    // Onay sayfasından gelen isteği kontrol et
    const referer = request.headers.get('referer');
    const fromPage = request.headers.get('x-from-page');
    const isOnayPage = (referer && referer.includes('/sepet/odeme/onay')) || fromPage === 'onay';
    
    console.log('API: Onay sayfasından mı:', isOnayPage);
    console.log('API: Referer:', referer);
    console.log('API: X-From-Page:', fromPage);
    
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromRequest();
    
    // Onay sayfasından gelen istekler için özel işlem
    if (isOnayPage) {
      console.log('API: Onay sayfasından gelen istek için sipariş bilgisi getiriliyor');
      
      try {
        // Önce sipariş numarası ile arama yap
        console.log('API: Sipariş numarası ile arama yapılıyor');
        let { data: siparisByNo, error: queryError } = await supabase
          .from('siparis')
          .select('id, teslimat_tipi, odeme_bilgisi, siparis_tarihi, created_at, siparis_no, toplam_tutar')
          .eq('siparis_no', siparisId)
          .maybeSingle();
          
        if (queryError) {
          console.error('API: Sipariş numarası ile sorgulama hatası:', queryError);
        }
        
        // Bulunamadıysa, ID ile aramayı dene
        if (!siparisByNo && !isNaN(Number(siparisId))) {
          console.log('API: ID ile sorgulama yapılıyor');
          let { data: siparisById, error: queryError2 } = await supabase
            .from('siparis')
            .select('id, teslimat_tipi, odeme_bilgisi, siparis_tarihi, created_at, siparis_no, toplam_tutar')
            .eq('id', Number(siparisId))
            .maybeSingle();
            
          if (queryError2) {
            console.error('API: ID ile sorgulama hatası:', queryError2);
          }
          
          siparisByNo = siparisById;
        }
        
        // Eğer sipariş hâlâ bulunamadıysa, teslimat_tipi içinde sipariş numarasını ara
        if (!siparisByNo) {
          console.log('API: Teslimat tipi içinde sipariş numarası aranıyor');
          let { data: siparisByTeslimat, error: queryError3 } = await supabase
            .from('siparis')
            .select('id, teslimat_tipi, odeme_bilgisi, siparis_tarihi, created_at, siparis_no, toplam_tutar')
            .like('teslimat_tipi', `%${siparisId}%`)
            .maybeSingle();
            
          if (queryError3) {
            console.error('API: Teslimat tipi ile sorgulama hatası:', queryError3);
          }
          
          siparisByNo = siparisByTeslimat;
        }
        
        // Eğer bir sipariş bulduysa işleme devam et
        if (siparisByNo) {
          console.log('API: Sipariş bulundu:', siparisByNo);
          
          // Teslimat tipinden sipariş numarasını çıkarma işlemi
          let siparisNo = siparisByNo.siparis_no || siparisId;
          
          // Eğer siparis_no yoksa ve teslimat_tipi'nde sipariş numarası bilgisi varsa onu çıkaralım
          if (!siparisByNo.siparis_no && siparisByNo.teslimat_tipi && siparisByNo.teslimat_tipi.includes('_SIP-')) {
            const parts = siparisByNo.teslimat_tipi.split('_');
            if (parts.length > 1) {
              // Teslimat tipi formatı: "adres_SIP-20250514-123" şeklinde olabilir
              siparisNo = parts.slice(1).join('_');
              console.log('API: Teslimat tipinden çıkarılan sipariş numarası:', siparisNo);
              
              // Sipariş numarasını kaydetmek için güncelleme yapalım
              const { error: updateError } = await supabase
                .from('siparis')
                .update({ 
                  siparis_no: siparisNo,
                  teslimat_tipi: parts[0] // Temizlenmiş teslimat tipini de güncelle
                })
                .eq('id', siparisByNo.id);
                
              if (updateError) {
                console.error('API: Sipariş numarası güncelleme hatası:', updateError);
              } else {
                console.log('API: Sipariş numarası güncellendi:', siparisNo);
              }
            }
          }
          
          // Tutar kontrolü - sayı olduğundan emin olalım
          let toplamTutar = 0;
          if (siparisByNo.odeme_bilgisi && siparisByNo.odeme_bilgisi.tutar) {
            toplamTutar = parseFloat(siparisByNo.odeme_bilgisi.tutar);
          } else if (siparisByNo.toplam_tutar) {
            toplamTutar = parseFloat(siparisByNo.toplam_tutar);
          }
          
          return NextResponse.json({
            success: true,
            data: {
              id: siparisByNo.id,
              siparis_no: siparisNo,
              tarih: siparisByNo.siparis_tarihi || siparisByNo.created_at,
              durum: 'hazırlanıyor',
              odeme_bilgisi: siparisByNo.odeme_bilgisi || {
                yontem: 'bank-transfer',
                durum: 'beklemede',
                tutar: toplamTutar
              },
              toplam_tutar: toplamTutar
            }
          }, { headers });
        } else {
          // Sipariş bulunamadı, hata mesajı döndür
          console.log('API: Sipariş bulunamadı');
          // Hata mesajını dönelim ki kullanıcı anlasın
          return NextResponse.json({
            success: false,
            error: `Sipariş bulunamadı: ${siparisId}`,
            message: 'Belirtilen sipariş numarasına ait kayıt bulunamadı.'
          }, {
            status: 404,
            headers
          });
        }
      } catch (findError) {
        console.error('API: Sipariş arama hatası:', findError);
        // Hata durumunda hata mesajı döndürelim
        return NextResponse.json({
          success: false,
          error: 'Sipariş arama sırasında bir hata oluştu',
          message: findError instanceof Error ? findError.message : 'Bilinmeyen hata'
        }, {
          status: 500,
          headers
        });
      }
    }
    
    // Kullanıcı oturumu var mı kontrol et
    if (!userId) {
      console.log('API: Kullanıcı oturumu bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı, lütfen giriş yapınız' },
        { 
          status: 401,
          headers
        }
      );
    }
    
    // Kullanıcı bilgilerini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('API: Kullanıcı bilgileri alınamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgileri alınamadı' },
        { 
          status: 401,
          headers
        }
      );
    }
    
    // Kullanıcı oturumu varsa, sipariş bilgilerini getir
    let query = supabase.from('siparis').select(`
      id, 
      teslimat_tipi, 
      teslimat_adres_id, 
      fatura_adres_id,
      siparis_no,
      magaza_id, 
      montaj_bilgisi, 
      odeme_bilgisi, 
      durum, 
      siparis_durumu,
      toplam_tutar, 
      kargo_ucreti, 
      genel_toplam, 
      siparis_tarihi, 
      created_at,
      adres!inner(id, adres, adres_baslik, sehir, ilce),
      siparis_urunleri (
        id, 
        stok_id, 
        adet, 
        fiyat
      )
    `);

    // ID veya siparis_no ile sorgu yapalım
    if (!isNaN(Number(siparisId))) {
      // Sayısal ID ile sorgula
      query = query.eq('id', siparisId);
    } else {
      // Sipariş no ile sorgula
      query = query.eq('siparis_no', siparisId);
    }
    
    // Kullanıcıya ait olmalı
    query = query.eq('user_id', user.id);

    const { data: siparis, error: siparisError } = await query.maybeSingle();

    if (siparisError) {
      console.error('API: Sipariş sorgulama hatası:', siparisError);
      return NextResponse.json(
        { success: false, error: 'Sipariş bilgileri alınamadı' },
        { 
          status: 500,
          headers
        }
      );
    }

    if (!siparis) {
      // Teslimat tipinde sipariş numarası olma ihtimali var mı diye kontrol edelim
      const { data: teslimatSiparis, error: teslimatError } = await supabase
        .from('siparis')
        .select('*')
        .eq('user_id', user.id)
        .like('teslimat_tipi', `%${siparisId}%`)
        .maybeSingle();
        
      if (teslimatError) {
        console.error('API: Teslimat tipi ile sorgulama hatası:', teslimatError);
      }
      
      if (teslimatSiparis) {
        console.log('API: Teslimat tipinden sipariş bulundu');
        // teslimat_tipi'den sipariş numarasını çıkar
        let siparisNo = siparisId;
        if (teslimatSiparis.teslimat_tipi.includes('_SIP-')) {
          const parts = teslimatSiparis.teslimat_tipi.split('_');
          if (parts.length > 1) {
            siparisNo = parts.slice(1).join('_');
            console.log('API: Teslimat tipinden çıkarılan sipariş numarası:', siparisNo);
            
            // Sipariş numarasını kaydet
            const { error: updateError } = await supabase
              .from('siparis')
              .update({ siparis_no: siparisNo })
              .eq('id', teslimatSiparis.id);
              
            if (updateError) {
              console.error('API: Sipariş numarası güncelleme hatası:', updateError);
            }
          }
        }
        
        return NextResponse.json({ success: true, data: teslimatSiparis }, { headers });
      }
      
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı', status: 404 },
        { 
          status: 404,
          headers
        }
      );
    }

    return NextResponse.json({ success: true, data: siparis }, { headers });
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'İşlem sırasında bir hata oluştu',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    );
  }
} 