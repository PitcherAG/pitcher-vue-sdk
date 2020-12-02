import { createStore } from './store'
import { getFilesWithKeyword } from './files'

class ValidationsStore {
    id = 'validation'
    loaded = false
    state = {
        listviews: [],
        lookups: [],
        rules: []
    }
}

export function useValidationsStore() {
    return createStore(new ValidationsStore())
}

export async function loadValidations(keyword) {
    const store = useValidationsStore()
    if (!store.loaded) {
        const file = await getFilesWithKeyword(keyword)
        const res = await fetch('../../../' + file[0].vUrl)
        const data = await res.json()
        store.state = Object.assign(store.state, data)
        store.loaded = true
    }
    return store.state
}

export function useValidations() {
    return useValidationsStore().state
}
