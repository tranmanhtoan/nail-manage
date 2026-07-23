import { useTranslation } from 'react-i18next'

export function LanguageSwitch() {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-medium rounded bg-gray-100 hover:bg-gray-200 transition-colors"
      aria-label="Switch language"
    >
      {i18n.language === 'en' ? '🇻🇳 VI' : '🇺🇸 EN'}
    </button>
  )
}
