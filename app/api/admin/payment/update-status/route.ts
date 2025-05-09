import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Kullanıcı oturumunu ve admin rolünü kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Kullanıcının rolünü kontrol et
    const { data: userMeta } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userMeta || userMeta.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için admin yetkisi gereklidir' }, { status: 403 });
    }
    
    // Request body'den ödeme bilgilerini al
    const { referansNo, yeniDurum, not } = await request.json();
    
    if (!referansNo || !yeniDurum) {
      return NextResponse.json(
        { success: false, error: 'Referans numarası ve yeni durum gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Ödeme durumunu kontrol et
    if (!['beklemede', 'onaylandi', 'reddedildi', 'iade'].includes(yeniDurum)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ödeme durumu' }, 
        { status: 400 }
      );
    }
    
    // Ödeme kaydını bul
    const { data: odeme, error: odemeHata } = await supabase
      .from('odeme_log')
      .select('*')
      .eq('referans_no', referansNo)
      .single();
    
    if (odemeHata || !odeme) {
      return NextResponse.json(
        { success: false, error: 'Ödeme kaydı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Ödeme durumunu güncelle
    const { error: guncelleHata } = await supabase
      .from('odeme_log')
      .update({ 
        durum: yeniDurum,
        detaylar: {
          ...odeme.detaylar,
          guncelleme_notu: not,
          guncelleyen_admin: session.user.id,
          guncelleme_zamani: new Date().toISOString()
        }
      })
      .eq('referans_no', referansNo);
    
    if (guncelleHata) {
      return NextResponse.json(
        { success: false, error: 'Ödeme durumu güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // İlgili siparişin durumunu da güncelle
    const { data: siparisler, error: siparisHata } = await supabase
      .from('siparis')
      .select('id, odeme_bilgisi, siparis_durumu')
      .contains('odeme_bilgisi', { referans_no: referansNo });
    
    if (!siparisHata && siparisler && siparisler.length > 0) {
      // Her siparişi güncelle
      for (const siparis of siparisler) {
        const odemeBilgisi = siparis.odeme_bilgisi;
        odemeBilgisi.durum = yeniDurum;
        
        // Sipariş durumunu güncelle
        let siparisDurumu = siparis.siparis_durumu;
        if (yeniDurum === 'onaylandi') {
          siparisDurumu = 'hazirlaniyor';
        } else if (yeniDurum === 'reddedildi') {
          siparisDurumu = 'iptal_edildi';
        }
        
        await supabase
          .from('siparis')
          .update({ 
            odeme_bilgisi: odemeBilgisi,
            siparis_durumu: siparisDurumu
          })
          .eq('id', siparis.id);
      }
    }
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: 'Ödeme durumu başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('Ödeme durumu güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Ödeme durumu güncellenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 