import { fireEvent } from '../../event'

class Actions {
    #categoryActionMapping = {
        presentation: this.loadPresentation.bind(this),
        pdf: this.loadPDF.bind(this),
        '3D': this.load3D.bind(this),
        molecule: this.loadMolecule.bind(this),
        brochure: this.loadBrochure.bind(this),
        video: this.loadVideo.bind(this),
        'video-online': this.loadOnlineVideo.bind(this),
        surveys: this.loadSurvey.bind(this),
        zip: this.loadInteractive.bind(this)
    }

    addSlashes(value) {
        return (value + '')
            .replace(/[\\"']/g, '\\$&')
            .replace(/\\u0000/g, '\\0')
            .replace('"', '')
    }

    loadPresentation(file) {
        if (file.isCustomPdf) {
            this.loadCustomPDF(file)
        } else {
            fireEvent('loadPresentation', { dataOfPres: file })
        }
    }

    loadCustomPDF(file) {
        fireEvent('loadCustomPDF', { dataOfPres: file })
    }

    showPdf(file, options) {
        options.viewMode = options.viewMode == 1 ? 3 : 1
        options.file = file.vUrl
        options.pdfID = file.ID
        options.title = this.addSlashes(file.body)
        fireEvent('loadPDF', options)
    }

    loadPDF(file) {
        if (file.isCustom) {
            this.loadCustomPDF(file)
        } else {
            this.showPdf(file, {
                launchMode: 1,
                viewMode: file.year
            })
        }
    }

    loadModel(file, eventName) {
        const path = file.vUrl
        const folders = path.split('/')
        const title = this.addSlashes(file.body)
        if (folders.length) {
            fireEvent(eventName, {
                model: folders[1],
                folder: folders[0],
                title: title,
                fileID: file.ID
            })
        } else {
            fireEvent(eventName, {
                model: path,
                title: title,
                fileID: file.ID
            })
        }
    }

    loadMolecule(file) {
        this.loadModel(file, 'loadMolecule')
    }

    load3D(file) {
        this.loadModel(file, 'loadThreeD')
    }

    loadBrochure(file) {
        this.showPdf(file, {
            launchMode: 2,
            viewMode: file.year
        })
    }

    playVideo(file, isOnline) {
        const path = file.vUrl
        const title = this.addSlashes(file.body)
        const eventName = file.keywords && file.keywords.indexOf('ybVideo') > -1 ? 'loadYB' : 'loadMovie'
        fireEvent(eventName, {
            file: path,
            isOnline: isOnline,
            title: title,
            fileID: file.ID
        })
    }

    loadVideo(file) {
        this.playVideo(file, 0)
    }

    loadOnlineVideo(file) {
        this.playVideo(file, 1)
    }

    loadSurvey(file, parameters) {
        const path = file.vUrl
        const title = this.addSlashes(file.body)
        fireEvent('loadWebPageFromFolder', {
            ID: file.ID,
            urlValue: `${path.replace('.zip', '').replace('surveys', '')}/index.html`,
            title: title,
            showBar: true,
            folderName: 'surveys',
            allowPortrait: true,
            parameters: parameters
        })
    }

    loadInteractive(file, parameters) {
        const path = file.vUrl
        const title = this.addSlashes(file.body)
        let allowPortrait = 0, showBar = 1
        if (file.extra2 != null) {
            const parts = file.extra2.split('|')
            showBar = parts.length > 0 && parts[0] == 1 ? 0 : 1
            allowPortrait = parts.length > 1 && parts[1] == 1 ? 1 : 0
        }
        fireEvent('loadWebPageFromFolder', {
            ID: file.ID,
            urlValue: `${path.replace('.zip', '').replace('zip', '')}/index.html`,
            title: title,
            showBar: showBar,
            folderName: 'zip',
            allowPortrait: allowPortrait,
            parameters: parameters
        })
    }

    openContent(file, parameters) {
        if (this.#categoryActionMapping[file.category]) {
            this.#categoryActionMapping[file.category](file, parameters)
        }
    }
}

const FileActions = new Actions()

export { FileActions }
