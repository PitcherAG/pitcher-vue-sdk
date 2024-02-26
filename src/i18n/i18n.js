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
  async setLanguage(lang, { app = 'app', dir = 'translations', load = true, useDefaultJSON = false } = {}) {
    if (!this.state.availableLanguages[lang]) {
      throw new Error(`invalid language: ${lang}`)
    }

    if (load && lang !== 'en') {
      if (useDefaultJSON) {
        const response = await fetch(`../lang/${lang.toUpperCase()}.json`)
        const data = await response.json()

        for (const locale in data) {
          if (this.state.messages[locale]) {
            for (const msgid in data) {
              this.state.messages[locale][msgid] = data[msgid]
            }
          } else {
            this.state.messages[locale] = data
          }
        }
      } else {
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

export function trans(msgid, n = 0, placeholders) {
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

  if (placeholders && translated.indexOf('{') > -1) {
    translated = renderSimpleContext(translated, placeholders)
  }

  return translated
}

const $t = (msgid, context) => trans(msgid, 1, context)
const $gettext = (msgid, context) => trans(msgid, 1, context)
const $ngettext = (msgid, n, context) => trans(msgid, n, context)

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

Object.defineProperty(window, '$t', {
  get: () => translationFunctions.$t,
  set: (v) => {
    registerRepeatingTranslator('$t', v)
  },
})
Object.defineProperty(window, '$gettext', {
  get: () => translationFunctions.$gettext,
  set: (v) => {
    registerRepeatingTranslator('$gettext', v)
  },
})
Object.defineProperty(window, '$ngettext', {
  get: () => translationFunctions.$ngettext,
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
  // Exposes instance methods.
  _Vue.prototype.$gettext = $gettext
  _Vue.prototype.$ngettext = $ngettext
  _Vue.prototype.$t = $gettext
}
