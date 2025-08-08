/**
 * Language configuration constants for GitHub Agent
 */

export interface LanguageConfig {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English' },
  zh: { code: 'zh', name: 'Chinese (中文)' },
  ja: { code: 'ja', name: 'Japanese (日本語)' },
  es: { code: 'es', name: 'Spanish (Español)' },
  fr: { code: 'fr', name: 'French (Français)' },
  de: { code: 'de', name: 'German (Deutsch)' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Auto-detect language from system environment
 */
export function detectSystemLanguage(): SupportedLanguage {
  const systemLang = process.env.LANG?.split('.')[0]?.split('_')[0] as SupportedLanguage;
  return systemLang && systemLang in SUPPORTED_LANGUAGES ? systemLang : 'en';
}

/**
 * Get language configuration with fallback to English
 */
export function getLanguageConfig(language: string): LanguageConfig {
  // Handle auto-detection
  if (language === 'auto') {
    const detectedLang = detectSystemLanguage();
    return SUPPORTED_LANGUAGES[detectedLang];
  }

  // Return specified language or fallback to English
  const supportedLang = language as SupportedLanguage;
  return SUPPORTED_LANGUAGES[supportedLang] || SUPPORTED_LANGUAGES.en;
}
