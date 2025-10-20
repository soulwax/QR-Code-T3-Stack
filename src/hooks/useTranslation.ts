"use client";

import { useEffect, useState } from 'react';
import { TRANSLATIONS } from '~/locales';

type Locale = keyof typeof TRANSLATIONS;
type TranslationKey = keyof typeof TRANSLATIONS['en-US'];

const getLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en-US';

  const browserLocale = (navigator.languages?.[0] ?? navigator.language) || 'en-US';
  
  if (browserLocale in TRANSLATIONS) {
    return browserLocale as Locale;
  }
  
  const lang = browserLocale.split('-')[0];
  const localeKeys = Object.keys(TRANSLATIONS) as Locale[];
  const match = localeKeys.find((key) => key.startsWith(`${lang}-`));
  
  return match ?? 'en-US';
};

export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>('en-US');
  const [mounted, setMounted] = useState(false); // ADD THIS

  useEffect(() => {
    setMounted(true); // ADD THIS
    setLocale(getLocale());
  }, []);

  const t = (key: TranslationKey): string => {
    // Always return en-US until mounted to match server render
    if (!mounted) return TRANSLATIONS['en-US'][key] ?? key; // ADD THIS
    return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['en-US'][key] ?? key;
  };

  return { t, locale, setLocale, mounted }; // EXPORT mounted
};