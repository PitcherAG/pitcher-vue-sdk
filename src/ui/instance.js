import { fireEvent } from '../event'
import { loadServerJSON, useServerJSONStore } from './serverJSONStore'
import { FileActions } from './actions/file'

class PitcherInstance {
    store
    fileActions = FileActions

    constructor() {}

    async init() {
        await loadServerJSON()
        this.store = useServerJSONStore()
    }

    get uiFiles() {
        //return computed(() => this.store.state.files.filter(f => f.shouldShowInUI))
        return this.store.state.files.filter(f => f.shouldShowInUI)
    }

    get customFiles() {
        return this.store.state.customs
    }

    get presentations() {
        return this.store.state.presentations
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

    openContent(file) {
        this.fileActions.openContent(file)
    }
}

const Instance = new PitcherInstance()

export { Instance }
