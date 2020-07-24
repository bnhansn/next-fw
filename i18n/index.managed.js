// This file is based on generated ./index but manually managed
// to bypass async chunk loading in favor of including all
// translations into bundle.
import I18n from 'i18nline'
import i18n_en from './en.json'
import i18n_fr from './fr.json'
import i18n_hi from './hi.json'
import i18n_ja from './ja.json'
import i18n_pl from './pl.json'
import i18n_pt from './pt.json'
import i18n_ru from './ru.json'
import i18n_sk from './sk.json'
import i18n_default from './default.json'

I18n.supportedLocales = ['en', 'fr', 'hi', 'ja', 'pl', 'pt', 'ru', 'sk']
I18n.defaultLocale = 'en'

I18n.translations = {
  ...i18n_en,
  ...i18n_fr,
  ...i18n_hi,
  ...i18n_ja,
  ...i18n_pl,
  ...i18n_pt,
  ...i18n_ru,
  ...i18n_sk,
  ...i18n_default
}

export default I18n
