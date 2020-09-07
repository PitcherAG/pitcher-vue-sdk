import { loadServerJSON, useServerJSONStore } from './serverJSONStore'
import { FileActions } from './actions/file'
import { FavoriteActions } from './actions/favorite'
import { fireEvent } from '../event'

class PitcherInstance {
    store
    fileActions = FileActions
    favoriteActions = FavoriteActions

    constructor() {}

    async init() {
        await loadServerJSON()
        this.store = useServerJSONStore()
        this.favoriteActions.getFavorites()
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
        this.store.askPresentationOneTime = true
        this.fileActions.editFile()
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

    toggleFavorite(file) {
        if (file.isFavorite) {
            this.favoriteActions.removeFavorite(file)
        } else {
            this.favoriteActions.addFavorite(file)
        }
    }

    sendDocuments() {
        this.fileActions.sendDocuments()
    }

    launchFileWithKeyword(keyword) {
        this.fileActions.launchFileWithKeyword(keyword)
    }

    getExtraFieldValue(property, defaultValue) {
        let value = defaultValue
        try {
            if (typeof this.store.state.config.extraField === 'string') {
                this.store.state.config.extraField = JSON.parse(this.store.state.config.extraField)
            }
            if (typeof this.store.state.config.extraField[property] !== 'undefined') {
                value = this.store.state.config.extraField[property]
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                    value = JSON.parse(value)
                }
            }
        } catch (e) {
            console.warn('no property')
        }
        return value
    }

    get deviceMetadata() {
        return this.store.state.metadata
    }

    launchExternal(url) {
        fireEvent('launchExternal', { urlV: url })
    }

    updateStatusBadge(value) {}

    getCategoryLogoURL() {}

    loadPresentationsFromDB() {
        fireEvent('loadPresentationsFromDB', {})
    }

    editCustomFile(file) {
        this.store.askPresentationOneTime = true
        this.fileActions.editFile(file)
    }

    deleteCustomFile(file) {
        this.store.askPresentationOneTime = true
        this.fileActions.deleteFile(file)
    }

    sentPitcherEvent() {}

    async getPitcherCode() {
        return await fireEvent('getPitcherCode', { source: 'homescreen' })
    }
}

const Instance = new PitcherInstance()

export { Instance }
