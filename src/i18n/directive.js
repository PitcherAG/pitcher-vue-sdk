import looseEqual from './looseEqual'
import { applyPlaceholders, trans, useI18nStore } from './i18n'
import { uid } from '../utils/uid'

const updateTranslation = (el, binding, vnode) => {
  const attrs = vnode.data.attrs || {}
  const msgid = el.dataset.msgid
  const translateN = attrs['translate-n']
  const translatePlural = attrs['translate-plural']
  const isPlural = translateN !== undefined && translatePlural !== undefined
  let context = vnode.context

  if (!isPlural && (translateN || translatePlural)) {
    throw new Error(`\`translate-n\` and \`translate-plural\` attributes must be used together:${msgid}.`)
  }

  if (attrs['translate-params']) {
    console.warn(
      // eslint-disable-next-line max-len
      `\`translate-params\` is required as an expression for 
            v-translate directive. Please change to \`v-translate='params'\`: ${msgid}`
    )
  }

  if (binding.value && typeof binding.value === 'object') {
    context = Object.assign({}, vnode.context, binding.value)
  }

  el.innerHTML = isPlural
    ? applyPlaceholders(trans(translatePlural, translateN), context)
    : applyPlaceholders(trans(msgid, 0), context)
}

/**
 * A directive to translate content according to the current language.
 *
 * Use this directive instead of the component if you need to translate HTML content.
 * It's too tricky to support HTML content within the component because we cannot get the raw HTML to use as `msgid`.
 *
 * This directive has a similar interface to the <translate> component, supporting
 * `translate-comment`, `translate-context`, `translate-plural`, `translate-n`.
 *
 * `<p v-translate translate-comment='Good stuff'>This is <strong class='txt-primary'>Sparta</strong>!</p>`
 *
 * If you need interpolation, you must add an expression that outputs binding value that changes with each of the
 * context variable:
 * `<p v-translate="fullName + location">I am %{ fullName } and from %{ location }</p>`
 */
export default {
  bind(el, binding, vnode) {
    const i18n = useI18nStore()

    // Fix the problem with v-if, see #29.
    // Vue re-uses DOM elements for efficiency if they don't have a key attribute, see:
    // https://vuejs.org/v2/guide/conditional.html#Controlling-Reusable-Elements-with-key
    // https://vuejs.org/v2/api/#key
    if (!vnode.key) {
      vnode.key = uid()
    }

    // Get the raw HTML and store it in the element's dataset (as advised in Vue's official guide).
    el.dataset.msgid = el.innerHTML.replace(/ data-v-\S+=""/, '')

    // Store the current language in the element's dataset.
    el.dataset.currentLanguage = i18n.state.locale

    updateTranslation(el, binding, vnode)
  },
  update(el, binding, vnode) {
    const i18n = useI18nStore()

    let doUpdate = false

    // Trigger an update if the language has changed.
    if (el.dataset.currentLanguage !== i18n.state.locale) {
      el.dataset.currentLanguage = i18n.state.locale
      doUpdate = true
    }

    // Trigger an update if an optional bound expression has changed.
    if (!doUpdate && binding.expression && !looseEqual(binding.value, binding.oldValue)) {
      doUpdate = true
    }

    if (doUpdate) {
      updateTranslation(el, binding, vnode)
    }
  },
}
