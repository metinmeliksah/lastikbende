import { AnalysisResult, FormData } from '../types';

export interface FormattedReport {
  lastikBilgileri: FormData;
  sorunlar: Array<{
    tip: string;
    aciklama: string;
    onem: 'low' | 'medium' | 'high';
    onerilenAksiyon: string;
    aciliyet: 'immediate' | 'soon' | 'monitor' | 'optional';
  }>;
  tahminiOmur: {
    ay: number;
    guven: number;
  };
  bakimIhtiyaclari: {
    acil: string[];
    yakin: string[];
    gelecek: string[];
  };
  guvenlikDegerlendirmesi: {
    puan: number;
    oneriler: string[];
  };
}

export const formatAnalysisReport = (
  results: AnalysisResult,
  formData: FormData
): FormattedReport => {
  return {
    lastikBilgileri: formData,
    sorunlar: results.sorunlar.map((sorun) => ({
      tip: sorun.type,
      aciklama: sorun.description,
      onem: sorun.severity,
      onerilenAksiyon: sorun.suggestedAction,
      aciliyet: sorun.urgency,
    })),
    tahminiOmur: {
      ay: results.estimatedLifespan.months,
      guven: results.estimatedLifespan.confidence,
    },
    bakimIhtiyaclari: {
      acil: results.maintenanceNeeds.immediate,
      yakin: results.maintenanceNeeds.soon,
      gelecek: results.maintenanceNeeds.future,
    },
    guvenlikDegerlendirmesi: {
      puan: results.safetyScore,
      oneriler: results.oneriler,
    },
  };
};

export const generateReportSummary = (
  report: FormattedReport,
  formData: FormData
): string => {
  const sorunlarOzeti = report.sorunlar
    .map(
      (sorun) =>
        `- ${sorun.tip} (Önem: ${sorun.onem}, Aciliyet: ${sorun.aciliyet})`
    )
    .join('\n');

  const acilBakimlar = report.bakimIhtiyaclari.acil.map((bakim) => `- ${bakim}`).join('\n');
  const yakinBakimlar = report.bakimIhtiyaclari.yakin.map((bakim) => `- ${bakim}`).join('\n');

  return `
# Lastik Analiz Raporu Özeti

## Lastik Bilgileri
- Lastik Tipi: ${formData.lastikTipi}
- Marka: ${formData.marka}
- Model: ${formData.model}
- Ebat: ${formData.ebat}
- Üretim Yılı: ${formData.uretimYili}
- Kilometre: ${formData.kilometre}

## Tespit Edilen Sorunlar
${sorunlarOzeti}

## Tahmini Ömür
Kalan: ${report.tahminiOmur.ay} ay (Güven: %${Math.round(report.tahminiOmur.guven * 100)})

## Acil Bakım İhtiyaçları
${acilBakimlar || "Acil bakım gerektiren bir durum tespit edilmedi."}

## Yakın Gelecekteki Bakım İhtiyaçları
${yakinBakimlar || "Yakın gelecekte bakım gerektiren bir durum tespit edilmedi."}

## Güvenlik Değerlendirmesi
Puan: ${report.guvenlikDegerlendirmesi.puan}/10
`;
}; 