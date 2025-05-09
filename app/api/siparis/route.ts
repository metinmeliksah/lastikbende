import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to get user id from Supabase session
async function getUserIdFromRequest() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Oturum kontrolü başarısız. Lütfen giriş yapınız.' }, { status: 401 });
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

    // Sipariş numarası oluştur
    const siparisNo = body.siparisNo || `SIP-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Sipariş verilerini kaydet
    const { data: siparis, error: siparisError } = await supabase
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
        guncelleme_tarihi: new Date().toISOString()
      })
      .select()
      .single();

    if (siparisError) {
      console.error('Sipariş oluşturma hatası:', siparisError);
      throw siparisError;
    }

    if (!siparis) {
      console.error('Sipariş verisi dönmedi');
      throw new Error('Sipariş verisi döndürülemedi');
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
        throw urunlerError;
      }
    } else {
      console.warn('Eklenecek ürün bulunamadı');
    }

    return NextResponse.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      siparisNo: siparisNo
    });

  } catch (error: any) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
}

// Sipariş durumunu güncelle
export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
      throw findError;
    }

    if (!siparis) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('siparis')
      .update({ durum: body.durum })
      .eq('id', siparis.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Sipariş durumu güncellendi'
    });

  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Sipariş detaylarını getir
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const siparisId = request.nextUrl.searchParams.get('siparisId'); // siparisNo yerine siparisId kullanılmalı
  if (!siparisId) {
    return NextResponse.json(
      { success: false, error: 'Sipariş ID gerekli' },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: siparis, error: siparisError } = await supabase
      .from('siparis')
      .select(`
        *,
        siparis_urunleri (
          *
        )
      `)
      .eq('id', siparisId) // siparis_no yerine id kullanılmalı
      .eq('user_id', userId)
      .single();

    if (siparisError) throw siparisError;

    return NextResponse.json({
      success: true,
      data: siparis
    });

  } catch (error) {
    console.error('Sipariş detayı getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş detayları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 