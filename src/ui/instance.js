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
        return this.store.state.files.filter(f => f.shouldShowInUI)
    }

    get customFiles() {
        return this.store.state.customs
    }

    get presentations() {
        return this.store.state.presentations
    }

    createSlideSet() {
        this.fileActions.editFileWithId()
    }

    openContent(file) {
        this.fileActions.openContent(file)
    }

    get categories() {
        return this.store.state.categories
    }

    get parentCategories() {
        return this.store.state.categories.filter(c => c.parentCategory == '0')
    }

    get subCategories() {
        return this.store.state.categories.filter(c => c.parentCategory == '-1')
    }

    get category() {
        return this.store.state.category
    }

    set category(category) {
        this.store.setMainNav(category)
    }

    sendPickingContent(fileIds, via) {
        this.fileActions.sendPickingContent(fileIds, via)
    }
}

const Instance = new PitcherInstance()

export { Instance }
