export interface FormData {
  lastikTipi: string;
  marka: string;
  model: string;
  ebat: string;
  uretimYili: string;
  kilometre: string;
}

export interface FieldStatus {
  lastikTipi: {
    success: boolean;
    message: string;
  };
  marka: {
    success: boolean;
    message: string;
  };
  model: {
    success: boolean;
    message: string;
  };
  ebat: {
    success: boolean;
    message: string;
  };
  uretimYili: {
    success: boolean;
    message: string;
  };
  kilometre: {
    success: boolean;
    message: string;
  };
}

export interface AnalysisResult {
  yasPuani: number;
  kullanimPuani: number;
  mevsimselPuan: number;
  markaPuani: number;
  gorselDurum: number;
  sorunlar: {
    type: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    location?: string;
    description: string;
    suggestedAction: string;
    urgency: 'immediate' | 'soon' | 'monitor' | 'optional';
    estimatedCost: 'high' | 'medium' | 'low';
    safetyImpact: 'critical' | 'significant' | 'moderate' | 'minor';
    maintenanceType: 'replacement' | 'repair' | 'adjustment' | 'monitoring';
    visualSigns?: string;
    problemOrigin?: string;
  }[];
  oneriler: string[];
  ozet: string;
  detayliAnaliz?: string;
  safetyScore: number;
  maintenanceNeeds: {
    immediate: string[];
    soon: string[];
    future: string[];
  };
  estimatedLifespan: {
    months: number;
    confidence: number;
  };
} 