import { fireEvent } from '../event'
import { loadServerJSON, useServerJSONStore } from './serverJSONStore'
import { computed } from '@vue/composition-api'

class PitcherInstance {
    #store

    constructor() {}

    async init() {
        await loadServerJSON()
        this.#store = useServerJSONStore()
    }

    get uiFiles() {
        return computed(() => this.#store.state.files.filter(f => f.shouldShowInUI))
    }

    get customFiles() {
        return computed(() => this.#store.state.customs)
    }

    get presentations() {
        return computed(() => this.#store.state.presentations)
    }

    editFileWithId(file) {
        if (file) {
            fireEvent('editPresentation', {
                dataOfPres: file,
                chapters: [
                    {
                        nameV: 'Slides',
                        startIndex: 0,
                        endIndex: file.vNumber
                    }
                ]
            })
        } else {
            fireEvent('editPresentation', { mix: true, allowMix: true })
        }
    }

    createSlideSet() {
        this.editFileWithId()
    }
}

const Instance = new PitcherInstance()

export { Instance }
