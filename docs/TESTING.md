# Test Kılavuzu

## Test Stratejisi

LastikBende projesi için kapsamlı bir test stratejisi uygulanmaktadır. Bu strateji aşağıdaki test türlerini içerir:

- Unit Tests
- Integration Tests
- End-to-End Tests
- Performance Tests
- Security Tests

> Detaylı test stratejisi diyagramı için [Testing Strategy Diagram](diagrams/testing-strategy.md) dosyasını inceleyin.

## Test Ortamı

### Gereksinimler

- Node.js v18 veya üzeri
- npm veya yarn
- Jest
- Cypress
- Playwright

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Test ortamını hazırla
npm run test:setup
```

## Unit Tests

### Jest Yapılandırması

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Test Örnekleri

```typescript
// components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Test</Button>);
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <Button onClick={handleClick}>Click me</Button>
    );
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Integration Tests

### API Tests

```typescript
// api/__tests__/analyze.test.ts
import { analyzeTire } from '../analyze';

describe('Tire Analysis API', () => {
  it('analyzes tire image correctly', async () => {
    const result = await analyzeTire({
      imageUrl: 'test-image.jpg',
      formData: {
        lastikTipi: 'Yaz',
        marka: 'Michelin',
        model: 'Pilot Sport 4',
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('lastikDurumu');
  });
});
```

## End-to-End Tests

### Cypress Yapılandırması

```javascript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

### Test Örnekleri

```typescript
// cypress/e2e/analysis.cy.ts
describe('Tire Analysis Flow', () => {
  it('completes analysis process', () => {
    cy.visit('/analiz');
    cy.get('[data-testid="upload-input"]').attachFile('tire.jpg');
    cy.get('[data-testid="analyze-button"]').click();
    cy.get('[data-testid="result-card"]').should('be.visible');
  });
});
```

## Performance Tests

### Lighthouse

```bash
# Lighthouse testi çalıştır
npm run test:lighthouse
```

### Load Testing

```typescript
// tests/load/analyze.test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.post('http://localhost:3000/api/analyze', {
    imageUrl: 'test-image.jpg',
    formData: {
      lastikTipi: 'Yaz',
      marka: 'Michelin',
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Test Coverage

### Coverage Raporu

```bash
# Coverage raporu oluştur
npm run test:coverage
```

### Coverage Hedefleri

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## CI/CD Entegrasyonu

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Test Best Practices

1. Her özellik için test yazın
2. Testleri anlamlı isimlerle adlandırın
3. Testleri modüler ve bağımsız tutun
4. Mock'ları doğru kullanın
5. Edge case'leri test edin
6. Test coverage'ı koruyun
7. Testleri düzenli olarak güncelleyin

## Troubleshooting

### Yaygın Sorunlar

1. Test timeout'ları
2. Mock hataları
3. Async test sorunları
4. Coverage düşüklüğü

### Çözüm Önerileri

1. Timeout sürelerini ayarlayın
2. Mock'ları doğru yapılandırın
3. Async/await kullanın
4. Test coverage'ı artırın 