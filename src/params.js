import { createStore } from 'pinia'
import { fireEvent } from './event'
import { waitForWindowProp } from './utils'

/** For Pitcher Impact
|--------------------------------------------------
|	params
|--------------------------------------------------
**/

window.getParameters = function(text) {
    window.params = JSON.parse(text)
}

// params store
export const useParamsStore = createStore({
    id: 'params',
    state: () => ({
        account: null,
        contacts: null,
        salesForceUser: null
        // locale: computed(() => state.salesForceUser ? state.salesForceUser.LanguageLocaleKey : null)
    }),
    getters: {
        locale: state => {
            return state.salesForceUser
                ? state.salesForceUser.LanguageLocaleKey.split('_').join('-')
                : state.user
                ? state.user.LanguageLocaleKey.split('_').join('-')
                : null
        },
        language: state => {
            return state.salesForceUser
                ? state.salesForceUser.LanguageLocaleKey.split('_')[0].toLowerCase()
                : state.user
                ? state.user.LanguageLocaleKey.split('_')[0].toLowerCase()
                : null
        },
        context: state => {
            return {
                Account: state.account,
                Contact: state.contact,
                Contacts: state.contacts,
                User: state.salesForceUser ? state.salesForceUser : state.user
            }
        }
    }
})

// Params initializer
export async function loadParams() {
    const { state, patch } = useParamsStore()

    // for testing
    if (process.env.VUE_APP_PARAMS) {
        let preParams = JSON.parse(process.env.VUE_APP_PARAMS)
        patch(preParams)
        return state
    }

    const params = await waitForWindowProp('params')
    if (params) {
        patch(window.serverJSON)
    }
    return state
}

export function useParams() {
    return useParamsStore().state
}

/** For Pitcher Connect
|--------------------------------------------------
|	serverJSON
|--------------------------------------------------
**/

// These must to be attached on window
window.setMainNav = function(lastViewedCategory) {
    window.lastViewedCategory = lastViewedCategory
}

window.gotJSON = function(serverJSONV, documentPathV) {
    try {
        window.documentPath = documentPathV
        window.serverJSON = JSON.parse(serverJSONV)
        window.serverJSON.files.reverse()
        window.appID = window.serverJSON.appID
    } catch (e) {
        fireEvent('Error', e)
    }
}

window.loadPresentations = function() {}
window.showUI = function() {}

// serverJSON store
export const useServerJSONStore = createStore({
    id: 'serverJSON',
    state: () => ({
        files: [],
        categories: [],
        config: null,
        groups: [],
        appID: '',
        deviceName: null,
        messages: [],
        metadata: null,
        slides: [],
        supportEmail: null,
        md5: null,
        systemLang: null,
        locale: null,
        userfullname: null,
        ajaxtoken: null,
        isCustomerUI: false
    })
})

// serverJSON initializer
export async function loadServerJSON() {
    const { state, patch } = useServerJSONStore()

    // for testing
    if (process.env.VUE_APP_SERVERJSON) {
        // for testing
        let preServerJSON = JSON.parse(process.env.VUE_APP_SERVERJSON)
        patch(preServerJSON)
        return state
    }

    const serverJSON = await waitForWindowProp('serverJSON')
    if (serverJSON) {
        state.documentPath = window.documentPath
        patch(window.serverJSON)
    }
    return state
}

export function useServerJSON() {
    return useServerJSONStore().state
}
