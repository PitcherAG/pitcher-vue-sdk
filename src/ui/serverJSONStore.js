import { fireEvent } from '../event'
import { waitForWindowProp, joinPath } from '../utils'
import { createStore } from '../store'
import { reactive } from '@vue/composition-api'
import Vue from 'vue'

const UI_CONSTANTS = {
    IGNORE_CUSTOM_TYPE: 2,
    PARENT_CATEGORY_VALUE: '0'
}

class ServerJSONStore {
    id = 'serverJSON'
    firstLoad = true
    askPresentationOneTime = false
    state = reactive({
        files: [],
        slides: null,
        config: null,
        groups: null,
        appID: null,
        categories: [],
        supportEmail: null,
        deviceName: null,
        metadata: null,
        messages: null,
        appName: null,
        documentPath: null,
        presentations: [],
        customs: [],
        category: {},
        allowedIDs: []
    })

    getInitialCategory() {
        if (this.state.categories) {
            return (
                this.state.categories.find(c => c.isDefault) ||
                this.state.categories.find(c => c.parentCategory == UI_CONSTANTS.PARENT_CATEGORY_VALUE)
            )
        }
        return null
    }

    setMainNav(category) {
        if (category) {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(`${this.state.appID}.mainNavItem`, category.ID)
            }
            fireEvent('setCategory', { category: JSON.stringify(category) })
            this.state.category = category
            if (this.firstLoad) {
                this.firstLoad = false
                fireEvent('uiReady')
            }
        }
    }

    showUI() {
        if (this.state.categories) {
            const initialCategory = (!this.firstLoad && this.getLastCategory()) || this.getInitialCategory()
            if (initialCategory) {
                this.setMainNav(initialCategory)
            }
        } else {
            fireEvent('uiReady')
        }
    }

    isFileExpiredOrNotReady(now, startDate, endDate) {
        if (typeof startDate === 'undefined' || typeof endDate === 'undefined') return false
        if (startDate == null || endDate == null) return false
        if (startDate == 0 || endDate == 0) return false
        return startDate > now || endDate < now
    }

    shouldShowInUI(now, file) {
        if (
            file.ID[0] == 'T' ||
            file.typeV == 7 ||
            file.typeV == -1 ||
            file.typeV == 0 ||
            this.isFileExpiredOrNotReady(now, file.startDate, file.endDate)
        ) {
            return false
        }
        return true
    }

    parseCustomPdf(file) {
        file.ID = file.slideOrder.split(',')[0].split('|')[0]
        file.isCustomPdf = true
        return file
    }

    parsePresentations(files) {
        this.state.customs = []
        this.state.presentations = []
        files.forEach(file => this.parseSinglePresentation(file))
        if (this.askPresentationOneTime) {
            fireEvent('loadPresentationsFromDB', {})
            this.askPresentationOneTime = false
        }
    }

    addFileAsCustom(file) {
        const original = this.state.files.find(f => f.ID == file.ID)
        if (original) {
            const customFile = {}
            Object.assign(customFile, original)
            Object.assign(customFile, file)
            customFile.body = file.presentationName
            this.state.customs.push(customFile)
        }
    }

    mergePresentation(file) {
        this.state.presentations.push(file)
        const original = this.state.files.find(f => f.ID == file.ID)
        if (original) {
            Object.assign(original, file)
        }
    }

    parseSinglePresentation(file) {
        try {
            if (file.isCustom != UI_CONSTANTS.IGNORE_CUSTOM_TYPE) {
                if (typeof file.ID === 'undefined' || file.ID == null) {
                    file = this.parseCustomPdf(file)
                }
                if (file.vSubFolder == null) {
                    file.containsMultiple = true
                    file.vSubFolder = file.slideOrder.split(',')[0].split('|')[0]
                    file.ID = file.slideOrder.split(',')[0].split('|')[0]
                    if (file.vSubFolder.indexOf('_') == -1) {
                        file.isCustomPdf = true
                    } else {
                        file.ID = '' + parseInt(file.ID)
                    }
                }
                file.ID = '' + file.ID
                file.isCustom ? this.addFileAsCustom(file) : this.mergePresentation(file)
            }
            return true
        } catch (e) {
            fireEvent('Error', e)
        }
        return false
    }

    markFavorites(fileIdMapping) {
        this.state.files.forEach(file => {
            if (typeof file.isFavorite === 'undefined') {
                Vue.set(file, 'isFavorite', fileIdMapping[file.ID] || false)
            } else {
                file.isFavorite = fileIdMapping[file.ID] || false
            }
        })
    }
}

export const useServerJSONStore = () => {
    return createStore(new ServerJSONStore())
}

export async function loadServerJSON(timeout = 5) {
    const store = useServerJSONStore()

    await waitForWindowProp('Ti', 1)

    fireEvent('askJSON')

    const serverJSON = await waitForWindowProp('serverJSON', timeout)

    fireEvent('loadPresentationsFromDB', {})

    const presentationsObject = await waitForWindowProp('presentationsObject', timeout)

    if (serverJSON) {
        const now = new Date().getTime() / 1000
        serverJSON.files.forEach(f => {
            f.shouldShowInUI = store.shouldShowInUI(now, f)
            f.thumbnailUrl = joinPath(window.documentPath, f.thumb)
        })
        Object.assign(store.state, window.serverJSON)
        store.state.documentPath = window.documentPath
        if (presentationsObject) {
            store.parsePresentations(presentationsObject)
        }
    }

    store.showUI()

    return store.state
}

window.gotJSON = function(serverJSONV, documentPathV) {
    try {
        window.documentPath = documentPathV
        window.serverJSON = JSON.parse(serverJSONV)
    } catch (e) {
        fireEvent('Error', e)
    }
}

window.loadPresentations = function(presentationsObject) {
    if (typeof presentationsObject === 'string') {
        presentationsObject = JSON.parse(presentationsObject)
    }
    if (window.presentationsObject) {
        const store = useServerJSONStore()
        store.parsePresentations(window.presentationsObject)
    }
    window.presentationsObject = presentationsObject
}

window.setMainNav = function(mainNavID) {
    const store = useServerJSONStore()
    store.setMainNav(store.categories && store.categories.find(c => c.ID == mainNavID))
}

window.filterJSON = function(Ids) {
    if (typeof Ids === 'string') {
        Ids = JSON.parse(Ids)
    }
    window.allowedIDs = Ids
    const store = useServerJSONStore()
    store.state.allowedIDs = Ids
}

window.getAllowedIDs = function() {
    const store = useServerJSONStore()
    return store.state.allowedIDs
}
