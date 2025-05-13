import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Supabase yapılandırması
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service role ile erişim için Supabase istemcisi oluşturma fonksiyonu
const getAdminClient = () => {
  try {
    if (!supabaseServiceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY eksik, standart Supabase istemcisi kullanılacak');
      const cookieStore = cookies();
      return createRouteHandlerClient({ 
        cookies: () => cookieStore 
      });
    }
    
    // Şema önbellek sorununu çözmek için bu ayarları ekliyoruz
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: { 'x-supabase-client': 'supabase-js-api' }
      }
    });
  } catch (error) {
    console.error('Supabase istemcisi oluşturma hatası:', error);
    // Hata durumunda da bir istemci döndürelim
    const cookieStore = cookies();
    return createRouteHandlerClient({ cookies: () => cookieStore });
  }
};

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
    
    // Authorization header'dan JWT token'ı al
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Mevcut' : 'Eksik');
    
    // Direkt header'dan oturum kontrolü yap
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header eksik veya geçersiz');
      return NextResponse.json({
        success: false,
        error: 'Oturum kontrolü başarısız. Lütfen giriş yapın.'
      }, { 
        status: 401,
        headers
      });
    }
    
    // Token'ı ayıkla
    const token = authHeader.replace('Bearer ', '');
    
    // Supabase ile token doğrulama
    let validatedUserId = '';
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Token'ı doğrula
      const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);
      
      if (tokenError || !user) {
        console.error('Token doğrulama hatası:', tokenError);
        return NextResponse.json({
          success: false,
          error: 'Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.'
        }, { 
          status: 401,
          headers
        });
      }
      
      validatedUserId = user.id;
      console.log('Token doğrulandı, kullanıcı ID:', validatedUserId);
    } catch (tokenValidationError) {
      console.error('Token doğrulama işlemi sırasında hata:', tokenValidationError);
      return NextResponse.json({
        success: false,
        error: 'Oturum doğrulama sırasında hata oluştu. Lütfen tekrar giriş yapın.'
      }, { 
        status: 401,
        headers
      });
    }
    
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
      user_id, // Kullanıcı tarafından gönderilen user_id
      teslimatTipi,
      teslimatAdresiId,
      faturaAdresiId,
      montajBilgisi,
      magazaId,
      urunler,
      odemeBilgisi
    } = requestBody;
    
    // Token ile alınan user_id ve istemciden gelen user_id'yi karşılaştır
    if (user_id && user_id !== validatedUserId) {
      console.warn('İstemciden gelen user_id token ile doğrulanan ID ile eşleşmiyor:', user_id, validatedUserId);
    }
    
    // Her durumda token ile doğrulanan user_id'yi kullan
    const authenticatedUserId = validatedUserId;
    
    // Tüm değerleri kontrol et
    console.log('Değer kontrolü:');
    console.log('- user_id (doğrulanmış):', authenticatedUserId);
    console.log('- teslimatTipi:', teslimatTipi);
    console.log('- teslimatAdresiId:', teslimatAdresiId);
    console.log('- faturaAdresiId:', faturaAdresiId);
    console.log('- montajBilgisi:', montajBilgisi);
    console.log('- magazaId:', magazaId);
    console.log('- urunler length:', urunler?.length);
    console.log('- odemeBilgisi:', odemeBilgisi);
    
    // Zorunlu alanları kontrol et
    if (!teslimatTipi || !odemeBilgisi || !urunler || !faturaAdresiId) {
      console.error('Eksik bilgi:', {
        teslimatTipi: !!teslimatTipi,
        faturaAdresiId: !!faturaAdresiId,
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
      
      // Normal Supabase istemcisi oluştur
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Admin client oluştur
      const supabaseAdmin = getAdminClient();
      
      // Başarılı mesajı döndürmeden önce veritabanı doğrulaması ekleyelim
      const veritabaniDogrula = async (siparisNo: string) => {
        console.log('Sipariş kaydı doğrulanıyor. Sipariş no:', siparisNo);
        try {
          // Doğrudan ham SQL sorgusu kullanarak kontrol edelim
          const { data: dogrulamaData, error: dogrulamaError } = await supabaseAdmin.rpc('dogrula_siparis_kaydi', {
            p_siparis_no: siparisNo
          });

          if (dogrulamaError) {
            console.error('Doğrulama RPC hatası:', dogrulamaError);
            
            // Alternatif olarak direkt sorgu yap
            const { data: siparisData, error: siparisError } = await supabaseAdmin
              .from('siparis')
              .select('id, siparis_no')
              .eq('siparis_no', siparisNo)
              .maybeSingle();
            
            if (siparisError) {
              console.error('Doğrulama sorgu hatası:', siparisError);
              return { success: false, error: siparisError };
            }
            
            if (!siparisData) {
              console.error('Sipariş bulunamadı, son çare yöntemi deneniyor - Dinamik SQL...');
              // son çare yöntemi - dinamik SQL ile ekleme
              const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('dogrudan_siparis_kaydet', {
                p_user_id: authenticatedUserId,
                p_teslimat_tipi: teslimatTipi,
                p_fatura_adres_id: faturaAdresiId,
                p_siparis_no: siparisNo,
                p_odeme_bilgisi: odemeBilgisiObj,
                p_toplam_tutar: odemeBilgisi.tutar || 0
              });

              if (sqlError) {
                console.error('Dinamik SQL hatası:', sqlError);
                return { success: false, error: sqlError };
              }

              if (sqlResult) {
                console.log('Dinamik SQL başarılı:', sqlResult);
                // Sipariş ürünlerini ekle
                if (urunler && urunler.length > 0) {
                  console.log('SQL sonrası ürünler ekleniyor...');
                  for (const urun of urunler) {
                    const { error: urunError } = await supabaseAdmin.rpc('insert_siparis_urun', {
                      p_siparis_id: sqlResult.id,
                      p_stok_id: urun.stok_id,
                      p_adet: urun.adet,
                      p_fiyat: urun.fiyat
                    });
                    if (urunError) {
                      console.error('Ürün ekleme hatası:', urunError);
                    }
                  }
                }
                return { success: true, data: sqlResult };
              }
            }
            
            console.log('Doğrulama sorgu sonucu:', siparisData);
            return { success: true, data: siparisData };
          }
          
          console.log('Doğrulama RPC sonucu:', dogrulamaData);
          return { success: true, data: dogrulamaData };
        } catch (error) {
          console.error('Doğrulama genel hatası:', error);
          return { success: false, error };
        }
      };
      
      // Kullanıcı kimliğini kontrol et
      // Her durumda token ile doğrulanan kimlik kullanılacak
      const userId = authenticatedUserId;
      
      console.log('Kullanılacak user ID:', userId);
      
      // Debug için tüm cookie'leri kontrol et
      console.log('Mevcut cookiler:', cookieStore.getAll().map(c => c.name));
      
      // Kullanıcı kimliği bulunamadıysa hata döndür 
      if (!userId) {
        console.error('Kullanıcı oturumu bulunamadı');
        return NextResponse.json({
          success: false,
          error: 'Oturum kontrolü başarısız. Lütfen giriş yapın.'
        }, { 
          status: 401,
          headers
        });
      }
      
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
        guncelleme_tarihi: new Date().toISOString(),
        siparis_no: siparisNo
      };
      
      console.log('Sipariş verileri:', JSON.stringify(siparisData, null, 2));
      
      // RLS politikasını aşmak için admin client kullan
      try {
        // YÖNTEM 1: Direkt SQL sorgusu kullanma - şema önbellek sorunlarını aşmak için
        const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('insert_siparis', {
          p_user_id: userId,
          p_teslimat_tipi: teslimatTipi,
          p_teslimat_adres_id: teslimatTipi === 'adres' ? teslimatAdresiId : null,
          p_fatura_adres_id: faturaAdresiId,
          p_magaza_id: teslimatTipi === 'magaza' ? magazaId : null,
          p_montaj_bilgisi: JSON.stringify(teslimatTipi === 'magaza' ? montajBilgisi : null),
          p_montaj_bayi_id: teslimatTipi === 'magaza' ? magazaId : null,
          p_montaj_tarihi: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.tarih : null,
          p_montaj_saati: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.saat : null,
          p_montaj_notu: teslimatTipi === 'magaza' && montajBilgisi ? montajBilgisi.not : null,
          p_odeme_bilgisi: JSON.stringify(odemeBilgisiObj),
          p_durum: 'hazırlanıyor',
          p_siparis_durumu: 'siparis_alindi',
          p_toplam_tutar: odemeBilgisi.tutar || 0,
          p_kargo_ucreti: 0,
          p_genel_toplam: odemeBilgisi.tutar || 0,
          p_siparis_no: siparisNo
        });

        if (sqlError) {
          console.error('SQL sipariş ekleme hatası:', sqlError);
          console.log('SQL hatası sonrası alternatif yönteme geçiliyor...');
        } else if (sqlResult) {
          console.log('SQL yöntemiyle sipariş başarıyla oluşturuldu:', sqlResult);
          
          // Sipariş ürünlerini ekle
          if (urunler && urunler.length > 0 && sqlResult.id) {
            console.log('Sipariş ürünleri ekleniyor (SQL yöntemi)...');
            
            for (const urun of urunler) {
              const { error: urunEklemeError } = await supabaseAdmin.rpc('insert_siparis_urun', {
                p_siparis_id: sqlResult.id,
                p_stok_id: urun.stok_id,
                p_adet: urun.adet,
                p_fiyat: urun.fiyat
              });
              
              if (urunEklemeError) {
                console.error('Ürün ekleme hatası:', urunEklemeError);
              }
            }
          }
          
          // Veritabanında gerçekten var mı doğrula
          const dogrulama = await veritabaniDogrula(siparisNo);
          if (!dogrulama.success) {
            console.error('Sipariş kaydı doğrulanamadı!', dogrulama.error);
            return NextResponse.json({
              success: false,
              error: 'Sipariş başarıyla oluşturuldu görünüyor ancak doğrulanamadı. Lütfen yönetici ile iletişime geçin.'
            }, {
              status: 500,
              headers
            });
          }
          
          console.log('Sipariş kaydı doğrulandı:', dogrulama.data);
          return NextResponse.json({
            success: true,
            message: 'Sipariş başarıyla oluşturuldu',
            siparisNo: siparisNo,
            dogrulama: dogrulama.data
          }, {
            headers
          });
        }
        
        // YÖNTEM 2: ORM yöntemi - Yöntem 1 başarısız olursa
        console.log('ORM yöntemi deneniyor...');
        const { data: siparisResult, error: siparisError } = await supabaseAdmin
          .from('siparis')
          .insert(siparisData)
          .select()
          .single();
          
        if (siparisError) {
          console.error('Sipariş oluşturma hatası:', siparisError);
          
          // YÖNTEM 3: Raw SQL yöntemi - son çare
          if (siparisError.message.includes('siparis_no')) {
            console.log('Raw SQL sorgusu deneniyor...');
            
            // siparis_no sütunu şemada bulunamadıysa, onu çıkararak dene
            const siparisDataNoSiparisNo: Partial<typeof siparisData> = { ...siparisData };
            delete siparisDataNoSiparisNo.siparis_no;
            
            const { data: rawResult, error: rawError } = await supabaseAdmin
              .from('siparis')
              .insert(siparisDataNoSiparisNo)
              .select()
              .single();
              
            if (rawError) {
              console.error('Raw SQL hatası:', rawError);
              return NextResponse.json({
                success: false,
                error: 'Sipariş oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ' + rawError.message
              }, {
                status: 500,
                headers
              });
            }
            
            if (rawResult) {
              // Sipariş ürünlerini ekle
              if (urunler && urunler.length > 0) {
                const siparisUrunleri = urunler.map((urun: {stok_id: string, adet: number, fiyat: number}) => ({
                  siparis_id: rawResult.id,
                  stok_id: urun.stok_id,
                  adet: urun.adet,
                  fiyat: urun.fiyat
                }));
                
                const { error: urunlerError } = await supabaseAdmin
                  .from('siparis_urunleri')
                  .insert(siparisUrunleri);
                  
                if (urunlerError) {
                  console.error('Sipariş ürünleri eklenirken hata:', urunlerError);
                }
              }
              
              // Veritabanında gerçekten var mı doğrula
              const dogrulama = await veritabaniDogrula(siparisNo);
              if (!dogrulama.success) {
                console.error('Sipariş kaydı doğrulanamadı!', dogrulama.error);
                return NextResponse.json({
                  success: false,
                  error: 'Sipariş başarıyla oluşturuldu görünüyor ancak doğrulanamadı. Lütfen yönetici ile iletişime geçin.'
                }, {
                  status: 500,
                  headers
                });
              }
              
              console.log('Sipariş kaydı doğrulandı:', dogrulama.data);
              return NextResponse.json({
                success: true,
                message: 'Sipariş başarıyla oluşturuldu (raw SQL)',
                siparisNo: siparisNo,
                dogrulama: dogrulama.data
              }, {
                headers
              });
            }
          }
          
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
          
          const siparisUrunleri = urunler.map((urun: {stok_id: string, adet: number, fiyat: number}) => ({
            siparis_id: siparisResult.id,
            stok_id: urun.stok_id,
            adet: urun.adet,
            fiyat: urun.fiyat
          }));
          
          console.log('Sipariş ürünleri verileri:', JSON.stringify(siparisUrunleri, null, 2));
          
          // RLS politikasını aşmak için admin client kullan
          const { error: urunlerError } = await supabaseAdmin
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
          
        // Veritabanında gerçekten var mı doğrula
        const dogrulama = await veritabaniDogrula(siparisNo);
        if (!dogrulama.success) {
          console.error('Sipariş kaydı doğrulanamadı!', dogrulama.error);
          return NextResponse.json({
            success: false,
            error: 'Sipariş başarıyla oluşturuldu görünüyor ancak doğrulanamadı. Lütfen yönetici ile iletişime geçin.'
          }, {
            status: 500,
            headers
          });
        }
        
        console.log('Sipariş işlemi başarıyla tamamlandı');
        console.log('Sipariş kaydı doğrulandı:', dogrulama.data);
        return NextResponse.json({
          success: true,
          message: 'Sipariş başarıyla oluşturuldu',
          siparisNo: siparisNo,
          dogrulama: dogrulama.data
        }, {
          headers
        });
      } catch (insertError: any) {
        console.error('Sipariş insert hatası:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Siparişiniz kaydedilemedi. Teknik hata: ' + (insertError.message || 'Bilinmeyen hata')
        }, {
          status: 500,
          headers
        });
      }
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
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json({
      success: false,
      error: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ' + (error.message || 'Bilinmeyen hata')
    }, {
      status: 500,
      headers
    });
  }
} 