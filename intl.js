import I18n from './i18n/index.managed'

export const resolveLocale = (language) => {
  const { defaultLocale, supportedLocales } = I18n

  if (language && supportedLocales.indexOf(language) > -1) {
    return language
  } else if (language && language.match('-')) {
    language = language.split('-')[0]
    if (supportedLocales.indexOf(language) > -1) {
      return language
    }
  }
  return defaultLocale
}

export default I18n
