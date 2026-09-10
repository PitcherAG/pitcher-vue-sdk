/* eslint-disable no-param-reassign */
import Component from './component'
import Directive from './directive'
import { createStore } from '../store'
import { getTranslationIndex } from './plurals'
import { renderSimpleContext } from '../utils'

if (!window.fetch) {
  import(/* webpackChunkName: "polyfill-fetch" */ 'whatwg-fetch')
}

const defaultOptions = {
  availableLanguages: { en: 'English' },
  locale: 'en',
  messages: { en: {} },
}

class I18nStore {
  id = 'i18n'
  state = defaultOptions
  async setLanguage(lang, { app = 'app', dir = 'translations', load = true } = {}) {
    if (!this.state.availableLanguages[lang]) {
      throw new Error(`invalid language: ${lang}`)
    }

    if (load && lang !== 'en') {
      const response = await fetch(`${dir}/${lang}/${app}.json`)
      const data = await response.json()

      for (const locale in data) {
        if (this.state.messages[locale]) {
          for (const msgid in data[locale]) {
            this.state.messages[locale][msgid] = data[locale][msgid]
          }
        } else {
          this.state.messages[locale] = data[locale]
        }
      }
    }
    this.state.locale = lang
  }

  get isRTL() {
    return ['ar', 'iw'].includes(this.state.locale)
  }
}

export const useI18nStore = () => {
  return createStore(new I18nStore())
}

export function trans(msgid, n = 0) {
  // eslint-disable-next-line eqeqeq
  if (msgid == '') {
    return msgid
  }

  const store = useI18nStore()
  const language = store.state.locale
  const translations = store.state.messages[language] || store.state.messages[language.split(/[_-]/)[0]]

  let translated

  if (translations) {
    translated = translations[msgid.trim()]

    if (translated) {
      if (Array.isArray(translated)) {
        const index = getTranslationIndex(language, n)

        translated = translated[index]
      }
    } else {
      // console.warn(`Untranslated ${language} key found: ${msgid}`)
    }
  } else {
    console.warn(`No translations found for ${language}`)
  }

  if (!translated) {
    translated = msgid
  }

  return translated
}

// Placeholder interpolation happens OUTSIDE trans() and outside the repeating-translator
// chain below, not inside trans() itself. trans() always changed its output whenever it
// fell back to msgid and interpolated (values get filled in either way), so the chain's
// "did a translator already handle this?" check - comparing a translator's output to the
// original msgid - could never tell an untranslated-but-interpolated fallback apart from
// a real translation: whichever translator ran first always "won", even an empty/
// unpopulated store from another bundle that never loaded a language pack (this is how a
// second app - e.g. pitcher-impact-live-controls, loaded on the same page as another
// app's window.$t already correctly set up - can silently mask perfectly good
// translations). Interpolating once, after the chain has fully resolved which
// translator's answer to use, keeps that comparison meaningful.
export function applyPlaceholders(translated, placeholders) {
  return placeholders && typeof translated === 'string' && translated.indexOf('{') > -1
    ? renderSimpleContext(translated, placeholders)
    : translated
}

const $t = (msgid) => trans(msgid, 1)
const $gettext = (msgid) => trans(msgid, 1)
const $ngettext = (msgid, n) => trans(msgid, n)

const translationsRegistry = {}
const translationFunctions = {
  $t,
  $gettext,
  $ngettext,
}

function registerRepeatingTranslator(name, callback) {
  if (typeof callback === 'function') {
    if (!translationsRegistry[name]) {
      translationsRegistry[name] = new Set()

      if (translationFunctions[name]) {
        translationsRegistry[name].add(translationFunctions[name])
      }
    }

    translationsRegistry[name].add(callback)

    translationFunctions[name] = (msgid, ...rest) => {
      return Array.from(translationsRegistry[name]).reduce((prev, translate) => {
        if (prev === msgid) {
          return translate(msgid, ...rest)
        }

        return prev
      }, msgid)
    }
  }
}

const originalTranslationsFunctions = {
  $t: window.$t,
  $gettext: window.$gettext,
  $ngettext: window.$ngettext,
}

// Named (not inline) so the getter returns the same function reference on every access.
// context is still forwarded into translationFunctions.$t/etc (harmless - our own trans()
// ignores it now) so a chained *external* translator that expects it as a second argument
// keeps working exactly as before; applyPlaceholders below is then a safe no-op for it,
// since indexOf('{') finds nothing left once it has already interpolated.
function publicT(msgid, context) {
  return applyPlaceholders(translationFunctions.$t(msgid, context), context)
}
function publicGettext(msgid, context) {
  return applyPlaceholders(translationFunctions.$gettext(msgid, context), context)
}
function publicNgettext(msgid, n, context) {
  return applyPlaceholders(translationFunctions.$ngettext(msgid, n, context), context)
}

Object.defineProperty(window, '$t', {
  get: () => publicT,
  set: (v) => {
    registerRepeatingTranslator('$t', v)
  },
})
Object.defineProperty(window, '$gettext', {
  get: () => publicGettext,
  set: (v) => {
    registerRepeatingTranslator('$gettext', v)
  },
})
Object.defineProperty(window, '$ngettext', {
  get: () => publicNgettext,
  set: (v) => {
    registerRepeatingTranslator('$ngettext', v)
  },
})

if (
  originalTranslationsFunctions.$t ||
  originalTranslationsFunctions.$gettext ||
  originalTranslationsFunctions.$ngettext
) {
  window.$t = originalTranslationsFunctions.$t
  window.$gettext = originalTranslationsFunctions.$gettext
  window.$ngettext = originalTranslationsFunctions.$ngettext
}

window.translateUI = function(json) {
  console.warn('not implemented', JSON.parse(json))
}

export function TranslationPlugin(_Vue, options = {}) {
  Object.keys(options).forEach((key) => {
    if (Object.keys(defaultOptions).indexOf(key) === -1) {
      throw new Error(`${key} is an invalid option for the translate plugin.`)
    }
  })

  // eslint-disable-next-line no-param-reassign
  options = Object.assign(defaultOptions, options)

  const store = useI18nStore()

  Object.assign(options, store.state)
  // Makes <translate> available as a global component.
  // eslint-disable-next-line vue/component-definition-name-casing
  _Vue.component('translate', Component)

  // An option to support translation with HTML content: `v-translate`.
  _Vue.directive('translate', Directive)
  // Exposes instance methods. Not routed through the repeating-translator chain (matches
  // prior behaviour) - only the placeholder interpolation moved, to stay consistent with
  // window.$t/$gettext/$ngettext now that trans() itself no longer interpolates.
  _Vue.prototype.$gettext = (msgid, context) => applyPlaceholders($gettext(msgid), context)
  _Vue.prototype.$ngettext = (msgid, n, context) => applyPlaceholders($ngettext(msgid, n), context)
  _Vue.prototype.$t = _Vue.prototype.$gettext
}
