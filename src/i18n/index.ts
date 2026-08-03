import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

function getSavedLang(): string {
  try {
    return localStorage.getItem('lang') || 'en'
  } catch {
    return 'en'
  }
}

/**
 * Dynamically load translation JSON for a given language.
 * Only the active language is fetched — the other stays unloaded until switched.
 */
async function loadTranslation(lng: string): Promise<Record<string, string>> {
  switch (lng) {
    case 'vi':
      return (await import('./vi.json')).default
    default:
      return (await import('./en.json')).default
  }
}

const initialLng = getSavedLang()

// Load initial language synchronously-ish: init with empty resources,
// then add the bundle once loaded. The app renders instantly with keys
// as fallback, then re-renders with translations (typically <50ms).
i18n.use(initReactI18next).init({
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {},
  // Don't wait for translations before rendering — show keys briefly
  react: { useSuspense: false },
})

// Eagerly load the active language
loadTranslation(initialLng).then((translations) => {
  i18n.addResourceBundle(initialLng, 'translation', translations, true, true)
})

// When language changes, dynamically load that language's translations
i18n.on('languageChanged', async (lng) => {
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    const translations = await loadTranslation(lng)
    i18n.addResourceBundle(lng, 'translation', translations, true, true)
  }
})

export default i18n
