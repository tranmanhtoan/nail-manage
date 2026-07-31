import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import vi from './vi.json'

function getSavedLang(): string {
  try {
    return localStorage.getItem('lang') || 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: getSavedLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
