import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import { fetch as fetchPolyfill } from 'whatwg-fetch'
import Component from './component'
import Directive from './directive'
import { getTranslationIndex } from './plurals'
import { renderSimpleContext } from '../utils'
import { createStore } from '..'

if (!window.fetch) {
    import(/* webpackChunkName: "polyfill-fetch" */ 'whatwg-fetch')
}

const defaultOptions = {
    availableLanguages: { en: 'English' },
    locale: 'en',
    messages: { en: {} }
}

export const useI18nStore = () => {
    const s = {
        id: 'i18n',
        state: defaultOptions,
        setLanguage: async function(lang, load = true, dir = 'translations', app = 'app') {
            if (!this.state.availableLanguages[lang]) {
                throw new Error('invalid language: ' + lang)
            }

            if (load && lang != 'en') {
                const response = await fetch(`${dir}/${lang}/${app}.json`)
                this.state.messages[lang] = await response.json()
            }

            this.state.locale = lang
        }
    }
    return createStore(s)
}

export function trans(msgid, n = 0, placeholders) {
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
            console.warn(`Untranslated ${language} key found: ${msgid}`)
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

window.$gettext = function(msgid, context) {
    return trans(msgid, 1, context)
}

window.translateUI = function(json) {
    console.warn('not implemented', JSON.parse(json))
}

window.$t = function(msgid, context) {
    return trans(msgid, 1, context)
}

window.$ngettext = function(msgid, n, context) {
    return trans(msgid, n, context)
}

export function TranslationPlugin(_Vue, options = {}) {
    Object.keys(options).forEach(key => {
        if (Object.keys(defaultOptions).indexOf(key) === -1) {
            throw new Error(`${key} is an invalid option for the translate plugin.`)
        }
    })

    options = Object.assign(defaultOptions, options)

    const store = useI18nStore()
    Object.assign(options, store.state)
    // Makes <translate> available as a global component.
    _Vue.component('translate', Component)

    // An option to support translation with HTML content: `v-translate`.
    _Vue.directive('translate', Directive)
    // Exposes instance methods.
    _Vue.prototype.$gettext = $gettext
    _Vue.prototype.$ngettext = $ngettext
    _Vue.prototype.$t = $gettext
}
