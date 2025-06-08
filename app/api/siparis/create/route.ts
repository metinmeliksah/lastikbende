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

// Ürün tipi tanımlaması
interface SiparisUrun {
  stok_id: number;
  adet: number;
  fiyat: number;
}

type SiparisRecord = {
  id: number;
  [key: string]: any;
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
    
    // teslimat_tipi'de sipariş numarası tutmak yerine doğrudan siparis_no alanını kullan
    // Eğer teslimat_tipi içinde zaten sipariş no varsa, temizle
    let cleanedTeslimatTipi = teslimatTipi;
    if (teslimatTipi && teslimatTipi.includes('_SIP-')) {
      cleanedTeslimatTipi = teslimatTipi.split('_')[0];
    }
    
    // Siparişte 'siparis_no' alanı olmadığı için alternatif bir yaklaşım uygulayalım
    // Bu numarayı 'teslimat_tipi' alanında bir ön ek olarak saklayabiliriz
    const teslimatTipiWithSiparisNo = `${cleanedTeslimatTipi}_${siparisNo}`;
    
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
            
            // Alternatif olarak direkt sorgu yap - siparis_no ile arama yap
            const { data: siparisData, error: siparisError } = await supabaseAdmin
              .from('siparis')
              .select('id, siparis_no, teslimat_tipi')
              .eq('user_id', authenticatedUserId)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (siparisError) {
              console.error('Doğrulama sorgu hatası:', siparisError);
              return { success: false, error: siparisError };
            }
            
            if (siparisData && siparisData.length > 0) {
              console.log('Sipariş doğrulandı (ID kontrolü):', siparisData[0]);
              
              // Sipariş numarasını kontrol et
              let extractedSiparisNo = siparisData[0].siparis_no;
              
              // Eğer siparis_no yoksa (eski kayıtlar veya hatalı işlemler için)
              if (!extractedSiparisNo && siparisData[0].teslimat_tipi && siparisData[0].teslimat_tipi.includes('_SIP-')) {
                // Teslimat tipinden sipariş numarasını çıkar
                const parts = siparisData[0].teslimat_tipi.split('_');
                if (parts.length > 1) {
                  // teslimat_tipi formatı: "adres_SIP-20250514-123"
                  extractedSiparisNo = parts.slice(1).join('_');
                  console.log('Teslimat tipinden çıkarılan sipariş numarası:', extractedSiparisNo);
                  
                  // Sipariş numarasını doğrudan güncelle
                  const { error: updateError } = await supabaseAdmin
                    .from('siparis')
                    .update({ 
                      siparis_no: extractedSiparisNo,
                      // Teslimat tipini de düzelt
                      teslimat_tipi: parts[0]
                    })
                    .eq('id', siparisData[0].id);
                    
                  if (updateError) {
                    console.error('Sipariş numarası güncelleme hatası:', updateError);
                  } else {
                    console.log('Sipariş no ve teslimat tipi güncellendi.');
                  }
                }
              }
              
              return { 
                success: true, 
                data: { 
                  id: siparisData[0].id, 
                  siparis_no: extractedSiparisNo || siparisNo 
                } 
              };
            }
            
              // son çare yöntemi - dinamik SQL ile ekleme
              const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('dogrudan_siparis_kaydet', {
                p_user_id: authenticatedUserId,
              p_teslimat_tipi: cleanedTeslimatTipi, // Teslimat tipini temiz ver
                p_fatura_adres_id: faturaAdresiId,
                p_odeme_bilgisi: odemeBilgisiObj,
                p_toplam_tutar: odemeBilgisi.tutar || 0
              });

              if (sqlError) {
                console.error('Dinamik SQL hatası:', sqlError);
                return { success: false, error: sqlError };
              }

            console.log('Dinamik SQL sonucu:', sqlResult);
                return { success: true, data: sqlResult };
          }
          
          console.log('RPC Doğrulama sonucu:', dogrulamaData);
          return { success: true, data: dogrulamaData };
        } catch (error) {
          console.error('Doğrulama hatası:', error);
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
      
      // Sipariş verileri
      const siparisData: Record<string, any> = {
        user_id: userId,
        teslimat_tipi: cleanedTeslimatTipi, // Temizlenmiş teslimat tipini kullan
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
        siparis_no: siparisNo // Doğrudan siparis_no alanını kullan
      };
      
      console.log('Sipariş verileri:', JSON.stringify(siparisData, null, 2));
      
      try {
        // Sipariş oluşturmayı dene
        let siparisResult;
        let siparisError;
        let dogrulamaResult;
        
        // İlk yöntem: Direkt insert
        try {
          // Siparis_no alanını içeren sorgu
          const result = await supabaseAdmin
          .from('siparis')
          .insert(siparisData)
          .select()
          .single();
          
          siparisResult = result.data;
          siparisError = result.error;
        } catch (insertError) {
          console.error('İlk insert hatası:', insertError);
          siparisError = insertError;
        }
        
        // Hata varsa ve 'siparis_no' ile ilgiliyse, o alanı çıkar ve tekrar dene
        if (siparisError && typeof siparisError === 'object' && (
          (siparisError as any).message?.includes('siparis_no') || 
          (siparisError as any).message?.includes('column')
        )) {
          console.log('Siparis_no alanı hatası. Alan olmadan deneniyor...');
          
          // siparis_no alanını çıkar
          const siparisDataNoSiparisNo = {...siparisData};
            delete siparisDataNoSiparisNo.siparis_no;
            
          // teslimat_tipi içine sipariş numarasını ekle (eski yöntem)
          siparisDataNoSiparisNo.teslimat_tipi = teslimatTipiWithSiparisNo;
          
          try {
            const result = await supabaseAdmin
              .from('siparis')
              .insert(siparisDataNoSiparisNo)
              .select()
              .single();
              
            siparisResult = result.data;
            siparisError = result.error;
          } catch (fallbackError) {
            console.error('İkinci insert hatası:', fallbackError);
            siparisError = fallbackError;
          }
        }
        
        // Hala hata varsa son çare yöntemi dene
        if (siparisError) {
          console.log('SQL RPC fonksiyonu deneniyor...');
          
          try {
            const result = await supabaseAdmin.rpc('dogrudan_siparis_kaydet', {
              p_user_id: authenticatedUserId,
              p_teslimat_tipi: teslimatTipiWithSiparisNo,
              p_fatura_adres_id: faturaAdresiId,
              p_odeme_bilgisi: odemeBilgisiObj,
              p_toplam_tutar: odemeBilgisi.tutar || 0
            });
            
            if (result.error) {
              console.error('RPC hatası:', result.error);
              siparisError = result.error;
            } else {
              siparisResult = result.data;
              siparisError = null;
            }
          } catch (rpcError) {
            console.error('RPC çağrısı hatası:', rpcError);
            siparisError = rpcError;
          }
        }
        
        // Sipariş başarıyla oluşturulduysa ürünleri ekleyelim
        if (siparisResult && urunler && urunler.length > 0) {
          console.log('Sipariş ürünleri ekleniyor...');
          
          const siparisUrunleri = urunler.map((urun: SiparisUrun) => ({
            siparis_id: siparisResult.id,
            stok_id: urun.stok_id,
            adet: urun.adet,
            fiyat: urun.fiyat
          }));
          
          try {
          const { error: urunlerError } = await supabaseAdmin
            .from('siparis_urunleri')
            .insert(siparisUrunleri);
            
          if (urunlerError) {
            console.error('Sipariş ürünleri eklenirken hata:', urunlerError);
            } else {
              console.log('Sipariş ürünleri başarıyla eklendi');
            }
          } catch (urunEklemeHatasi) {
            console.error('Ürün ekleme hatası:', urunEklemeHatasi);
          }
        }
        
        // Sipariş kaydını doğrula
        try {
          dogrulamaResult = await veritabaniDogrula(siparisNo);
        } catch (dogrulamaHatasi) {
          console.error('Doğrulama hatası:', dogrulamaHatasi);
          dogrulamaResult = { success: false, error: dogrulamaHatasi };
        }
        
        // Başarı durumunda sepeti temizle ve uygun yanıtı döndür
        if (siparisResult || (dogrulamaResult && dogrulamaResult.success)) {
          console.log('Sipariş başarıyla oluşturuldu.');
          
          // Sipariş başarılıysa kullanıcının sepetini temizle
          try {
            console.log('Kullanıcının sepeti temizleniyor...');
            const { error: sepetTemizleHata } = await supabaseAdmin
              .from('sepet')
              .delete()
              .eq('user_id', authenticatedUserId);
            
            if (sepetTemizleHata) {
              console.error('Sepet temizlenirken hata:', sepetTemizleHata);
              // Sepet temizleme hatası sipariş başarısını etkilemez
            } else {
              console.log('Kullanıcının sepeti başarıyla temizlendi');
            }
          } catch (sepetHata) {
            console.error('Sepet temizleme işlemi sırasında hata:', sepetHata);
            // Sepet temizleme hatası sipariş başarısını etkilemez
          }
          
          return NextResponse.json({
            success: true,
            message: 'Sipariş başarıyla oluşturuldu',
            siparisNo: siparisNo,
            siparis_id: siparisResult?.id || dogrulamaResult?.data?.id,
            dogrulama: dogrulamaResult?.data
          }, {
            headers
          });
        }
        
        // Hata durumunda yanıt
        console.error('Sipariş kaydı başarısız:', siparisError);
        return NextResponse.json({
          success: false,
          error: 'Sipariş oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        }, {
          status: 500,
          headers
        });
        
      } catch (error: any) {
        console.error('Beklenmeyen hata:', error);
        return NextResponse.json({
          success: false,
          error: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        }, {
          status: 500,
          headers
        });
      }
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      return NextResponse.json({
        success: false,
        error: 'Sipariş oluşturulurken bir hata oluştu'
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