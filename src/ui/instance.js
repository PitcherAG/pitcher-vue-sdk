import { loadServerJSON, useServerJSONStore } from './serverJSONStore'

class PitcherInstance {
    #store

    constructor() {}

    async init() {
        await loadServerJSON()
        this.#store = useServerJSONStore()
    }

    get uiFiles() {
        return this.#store.state.files.filter(f => f.shouldShowInUI)
    }
}

const Instance = new PitcherInstance()

export { Instance }
