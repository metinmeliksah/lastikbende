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
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Sipariş verilerini kaydet
    const { data: siparis, error: siparisError } = await supabase
      .from('siparisler')
      .insert({
        user_id: userId,
        siparis_no: body.siparisNo,
        teslimat_tipi: body.teslimatBilgileri.tip,
        teslimat_adresi: body.teslimatBilgileri.teslimatAdresi || null,
        magaza_bilgileri: body.teslimatBilgileri.magaza || null,
        fatura_adresi: body.faturaAdresi,
        toplam_tutar: body.toplamTutar,
        kargo_ucreti: body.kargoUcreti,
        genel_toplam: body.genelToplam,
        durum: body.durum,
        odeme_tipi: body.odemeYontemi
      })
      .select()
      .single();

    if (siparisError) throw siparisError;

    // Sipariş ürünlerini kaydet
    const siparisUrunleri = body.urunler.map((urun: any) => ({
      siparis_id: siparis.id,
      urun_id: urun.id,
      adet: urun.adet,
      birim_fiyat: urun.fiyat,
      toplam_fiyat: urun.fiyat * urun.adet
    }));

    const { error: urunlerError } = await supabase
      .from('siparis_urunleri')
      .insert(siparisUrunleri);

    if (urunlerError) throw urunlerError;

    return NextResponse.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      siparisNo: body.siparisNo
    });

  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş oluşturulurken bir hata oluştu' },
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

    const { error } = await supabase
      .from('siparisler')
      .update({ durum: body.durum })
      .eq('siparis_no', body.siparisNo)
      .eq('user_id', userId);

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

  const siparisNo = request.nextUrl.searchParams.get('siparisNo');
  if (!siparisNo) {
    return NextResponse.json(
      { success: false, error: 'Sipariş numarası gerekli' },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: siparis, error: siparisError } = await supabase
      .from('siparisler')
      .select(`
        *,
        siparis_urunleri (
          *,
          urunler (*)
        )
      `)
      .eq('siparis_no', siparisNo)
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