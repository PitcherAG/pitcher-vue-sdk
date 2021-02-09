import { createStore } from '../../store'
import { reactive } from '@vue/composition-api'

class SystemStore {
  id = 'systemStore'
  state = reactive({
    config: null,
    groups: null,
    appID: null,
    supportEmail: null,
    deviceName: null,
    metadata: null,
    messages: null,
    appName: null,
    systemLang: null,
    locale: null,
    userfullname: null,
    ajaxtoken: null,
    isCustomerUI: false,
    batteryLevel: 0,
    statusBadge: 0,
    todoBadge: 0
  })
}

export const useSystemStore = () => {
  return createStore(new SystemStore())
}

export function getExtraFieldValue(property, defaultValue) {
  const store = useSystemStore()
  let value = defaultValue
  try {
    if (typeof store.state.config.extraField === 'string') {
      store.state.config.extraField = JSON.parse(store.state.config.extraField)
    }
    if (typeof store.state.config.extraField[property] !== 'undefined') {
      value = store.state.config.extraField[property]
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        value = JSON.parse(value)
      }
    }
  } catch (e) {
    if (process.env.LOG) {
      console.log(e)
    }
  }
  return value
}

window.updateStatusBadge = function(value) {
  const store = useSystemStore()
  value = parseInt(value)
  store.state.statusBadge = value || 0
}

window.updateTodoBadge = function(value) {
  const store = useSystemStore()
  value = parseInt(value)
  store.state.todoBadge = value || 0
}
