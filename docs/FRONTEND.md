# Frontend Dokümantasyonu

## Genel Bakış

LastikBende frontend uygulaması Next.js 14, React 18, TypeScript ve Tailwind CSS kullanılarak geliştirilmiştir. Modern web standartlarına uygun, performans odaklı ve kullanıcı dostu bir arayüz sunmayı hedeflemektedir.

## Teknoloji Yığını

- **Framework**: Next.js 14
- **UI Kütüphanesi**: React 18
- **Programlama Dili**: TypeScript
- **Styling**: Tailwind CSS
- **State Yönetimi**: React Query, Context API
- **Form Yönetimi**: React Hook Form, Zod
- **UI Bileşenleri**: Shadcn/ui
- **Animasyonlar**: Framer Motion
- **Grafikler**: Recharts
- **i18n**: next-i18next

## Proje Yapısı

```
app/
├── (auth)/              # Kimlik doğrulama sayfaları
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/         # Dashboard sayfaları
│   ├── analyses/
│   ├── orders/
│   └── settings/
├── api/                 # API route'ları
├── components/          # Paylaşılan bileşenler
├── lib/                 # Yardımcı fonksiyonlar
└── styles/             # Global stiller

components/
├── ui/                 # Temel UI bileşenleri
├── forms/              # Form bileşenleri
├── layout/             # Layout bileşenleri
└── features/           # Özellik bazlı bileşenler
    ├── analysis/       # Lastik analiz bileşenleri
    ├── auth/           # Kimlik doğrulama bileşenleri
    └── dashboard/      # Dashboard bileşenleri
```

## Bileşen Mimarisi

### 1. UI Bileşenleri

#### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}) => {
  // Bileşen implementasyonu
};
```

#### Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  ...props
}) => {
  // Bileşen implementasyonu
};
```

### 2. Form Bileşenleri

#### AnalysisForm

```typescript
interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => void;
  initialData?: Partial<AnalysisFormData>;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onSubmit,
  initialData
}) => {
  // Form implementasyonu
};
```

### 3. Layout Bileşenleri

#### DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  // Layout implementasyonu
};
```

## State Yönetimi

### 1. React Query Kullanımı

```typescript
// hooks/useAnalysis.ts
export const useAnalysis = (analysisId: string) => {
  return useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => fetchAnalysis(analysisId),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};
```

### 2. Context API Kullanımı

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // Context implementasyonu
};
```

## Stil Rehberi

### 1. Tailwind CSS Kullanımı

```typescript
// Örnek bileşen stili
const Card = () => {
  return (
    <div className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Başlık
      </h2>
      <p className="text-gray-600">
        İçerik
      </p>
    </div>
  );
};
```

### 2. Tema Değişkenleri

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
};
```

## Performans Optimizasyonu

### 1. Code Splitting

```typescript
// Dinamik import örneği
const AnalysisChart = dynamic(() => import('@/components/features/analysis/Chart'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### 2. Image Optimizasyonu

```typescript
import Image from 'next/image';

const OptimizedImage = () => {
  return (
    <Image
      src="/images/tire.jpg"
      alt="Lastik görüntüsü"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
};
```

## i18n Yapılandırması

### 1. Dil Dosyaları

```typescript
// public/locales/tr/common.json
{
  "analysis": {
    "title": "Lastik Analizi",
    "upload": "Görüntü Yükle",
    "analyze": "Analiz Et"
  }
}
```

### 2. Kullanım

```typescript
import { useTranslation } from 'next-i18next';

const AnalysisPage = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('analysis.title')}</h1>
      <button>{t('analysis.analyze')}</button>
    </div>
  );
};
```

## Test Stratejisi

### 1. Unit Testler

```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Tıkla</Button>);
    expect(getByText('Tıkla')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <Button onClick={handleClick}>Tıkla</Button>
    );
    fireEvent.click(getByText('Tıkla'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 2. E2E Testler

```typescript
// cypress/e2e/analysis.cy.ts
describe('Lastik Analizi', () => {
  it('should upload and analyze tire image', () => {
    cy.visit('/analysis');
    cy.get('[data-testid="file-input"]').attachFile('tire.jpg');
    cy.get('[data-testid="analyze-button"]').click();
    cy.get('[data-testid="analysis-result"]').should('be.visible');
  });
});
```

## Hata Yönetimi

### 1. Error Boundary

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### 2. API Hata Yönetimi

```typescript
// lib/api.ts
export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Oturum hatası
        break;
      case 403:
        // Yetki hatası
        break;
      default:
        // Genel hata
        break;
    }
  }
  // Hata loglama
};
```

## Güvenlik

### 1. XSS Koruması

```typescript
// lib/security.ts
export const sanitizeInput = (input: string): string => {
  return input.replace(/[&<>"']/g, (char) => {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char];
  });
};
```

### 2. CSRF Koruması

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CSRF token kontrolü
  if (request.method === 'POST') {
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || csrfToken !== process.env.CSRF_TOKEN) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  return response;
}
``` 