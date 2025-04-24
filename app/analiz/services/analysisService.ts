import { supabase } from '@/lib/supabase';
import { AnalysisResult, FormData } from '../types';

export async function saveAnalysis(
  formData: FormData,
  analysisResult: AnalysisResult,
  imageUrl: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        lastik_tipi: formData.lastikTipi,
        marka: formData.marka,
        model: formData.model,
        ebat: formData.ebat,
        uretim_yili: parseInt(formData.uretimYili),
        kilometre: parseInt(formData.kilometre),
        yas_puani: analysisResult.yasPuani,
        kullanim_puani: analysisResult.kullanimPuani,
        mevsimsel_puan: analysisResult.mevsimselPuan,
        marka_puani: analysisResult.markaPuani,
        gorsel_durum: analysisResult.gorselDurum,
        safety_score: analysisResult.safetyScore,
        tahmini_omur_ay: analysisResult.estimatedLifespan.months,
        sorunlar: analysisResult.sorunlar,
        bakim_ihtiyaclari: analysisResult.maintenanceNeeds,
        ai_analiz: {
          summary: analysisResult.ozet,
          detailed: analysisResult.detayliAnaliz
        },
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Analiz kaydetme hatası:', error);
    throw error;
  }
} 