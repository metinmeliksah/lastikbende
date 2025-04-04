export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    VALIDATE: '/analiz/api/validate',
    CHAT: '/analiz/api/chat',
    ANALYZE: '/analiz/api/analyze'
  },
  HEADERS: {
    'Content-Type': 'application/json'
  },
  maxFileSize: 5 * 1024 * 1024, // 5MB
  yearRange: {
    min: 1900,
    max: new Date().getFullYear()
  }
}

export const API_ENDPOINTS = API_CONFIG.ENDPOINTS; 