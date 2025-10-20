import { deDE } from './de-DE';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { frFR } from './fr-FR';
import { jaJP } from './ja-JP';

export const TRANSLATIONS = {
  'en-US': enUS,
  'es-ES': esES,
  'de-DE': deDE,
  'fr-FR': frFR,
  'ja-JP': jaJP,
} as const;

// Export types for use in other files
export type Locale = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof enUS;