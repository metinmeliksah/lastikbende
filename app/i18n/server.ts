import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './config';

export default getRequestConfig(async ({locale}) => {
  // Ensure locale is a string and valid, TypeScript friendly
  const safeLocale: string = typeof locale === 'string' && locales.includes(locale as any) 
    ? locale 
    : defaultLocale;
  
  return {
    messages: (await import(`../analiz/translations/${safeLocale}.json`)).default,
    locale: safeLocale
  };
}); 