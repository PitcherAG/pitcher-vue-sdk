import moment from 'moment'
import { useParamsStore } from '../params'
import { useI18nStore } from '../i18n/i18n'

export function formatDate(date, showYear = true) {
  const locale = useParamsStore().locale || useI18nStore().state.locale

  if (!date) return ''

  let options

  if (showYear) {
    options = { year: '2-digit', month: '2-digit', day: '2-digit' }
  } else {
    options = { month: 'short', day: '2-digit' }
  }

  if (!locale) throw 'locale not defined'

  const m = moment(date)
  const d = m.toDate()
  return d.toLocaleDateString(locale, options)
}

export function formatTime(date, showSeconds = false) {
  const locale = useParamsStore().locale || useI18nStore().state.locale

  if (!date) return ''

  const options = {
    hour: '2-digit',
    minute: '2-digit'
  }
  if (showSeconds) {
    options.seconds = '2-digit'
  }

  if (!locale) throw 'locale not defined'

  const m = moment(date)
  const d = m.toDate()
  return d.toLocaleTimeString(locale, options)
}
