export const defaultLocale = 'tr';
export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export function getLocaleFromPathname(pathname: string): Locale {
  const locale = pathname.split('/')[1] as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}

export const messages = {
  tr: () => import('../analiz/translations/tr.json').then((module) => module.default),
  en: () => import('../analiz/translations/en.json').then((module) => module.default),
}; 