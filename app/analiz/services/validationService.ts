import { API_CONFIG } from '../config/api';

export interface ValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const validateField = async (
  field: string,
  value: string,
  context: any
): Promise<ValidationResponse> => {
  // Her zaman başarılı yanıt döndür
  return {
    success: true,
    message: 'Validation skipped'
  };
}; 