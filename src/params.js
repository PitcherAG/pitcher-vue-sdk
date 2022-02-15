import { createStore } from './store'
import { reactive, ref } from '@vue/composition-api'
import { waitForWindowProp } from './utils'

/** For Pitcher Impact
 |--------------------------------------------------
 |    Params
 |--------------------------------------------------
 **/

window.getParameters = function(text) {
  window.params = JSON.parse(text)
}

class ParamStore {
  id = 'params'
  state = reactive({
    account: ref(null),
    contacts: null,
    contact: null,
    salesForceUser: null,
    user: null,
  })

  get locale() {
    const user = this.state.salesForceUser ? this.state.salesForceUser : this.state.user
    let localeLangugage = null

    if (user) localeLangugage = user.LocaleSidKey ? user.LocaleSidKey : user.LanguageLocaleKey

    return localeLangugage
      ? localeLangugage
          .split('_')
          .slice(0, 2)
          .join('-')
      : null
  }

  get language() {
    if (this.state.salesForceUser) {
      return this.state.salesForceUser.LanguageLocaleKey.split('_')[0].toLowerCase()
    } else if (this.state.user) {
      return this.state.user.LanguageLocaleKey.split('_')[0].toLowerCase()
    } else if (this.state.config) {
      const isoLocaleMap = {
        AUSDE: 'de',
        BI: 'id',
        BR: 'pt',
        BU: 'bg',
        CAFR: 'fr',
        CZ: 'cs',
        DAN: 'da',
        ESMX: 'es',
        EST: 'et',
        JP: 'ja',
        LET: 'lv',
        PO: 'pl',
        PRT: 'pt',
        SCH: 'zh-CN',
        TCH: 'zh-TW',
        UA: 'uk',
        VN: 'vi',
      }

      if (isoLocaleMap[this.state.config.langV]) {
        return isoLocaleMap[this.state.config.langV]
      } else {
        return this.state.config.langV.toLowerCase()
      }
    }

    return null
  }

  get context() {
    return {
      Account: this.state.account,
      Contact: this.state.contact,
      Contacts: this.state.contacts,
      User: this.state.salesForceUser ? this.state.salesForceUser : this.state.user,
    }
  }
}

export function useParamsStore() {
  return createStore(new ParamStore())
}

// Params initializer
export async function loadParams() {
  const store = useParamsStore()

  // for testing
  if (process.env.VUE_APP_PARAMS) {
    const preParams = JSON.parse(process.env.VUE_APP_PARAMS)

    Object.assign(store.state, preParams)

    return store.state
  }

  const params = await waitForWindowProp('params')

  if (params) {
    Object.assign(store.state, window.params)
  }

  return store.state
}

export function useParams() {
  return useParamsStore().state
}
