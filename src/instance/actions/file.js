import { fireEvent } from '../../event'
import { useFilesStore } from '../stores/index'

const categoryActionMapping = {
  presentation: loadPresentation,
  pdf: loadPDF,
  '3D': load3D,
  molecule: loadMolecule,
  brochure: loadBrochure,
  video: loadVideo,
  'video-online': loadOnlineVideo,
  surveys: loadSurvey,
  zip: loadInteractive
}

function addSlashes(value) {
  return (value + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\\u0000/g, '\\0')
    .replace('"', '')
}

function loadPresentation(file) {
  if (file.isCustomPdf) {
    loadCustomPDF(file)
  } else {
    fireEvent('loadPresentation', { dataOfPres: file })
  }
}

function loadCustomPDF(file) {
  fireEvent('loadCustomPDF', { dataOfPres: file })
}

function showPdf(file, options) {
  options.viewMode = options.viewMode == 1 ? 3 : 1
  options.file = file.vUrl
  options.pdfID = file.ID
  options.titleV = addSlashes(file.body)
  fireEvent('loadPDF', options)
}

function loadPDF(file) {
  if (file.isCustom) {
    loadCustomPDF(file)
  } else {
    showPdf(file, {
      launchMode: 1,
      viewMode: file.year
    })
  }
}

function loadModel(file, eventName) {
  const path = file.vUrl
  const folders = path.split('/')
  const title = addSlashes(file.body)
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

function loadMolecule(file) {
  loadModel(file, 'loadMolecule')
}

function load3D(file) {
  loadModel(file, 'loadThreeD')
}

function loadBrochure(file) {
  showPdf(file, {
    launchMode: 2,
    viewMode: file.year
  })
}

function playVideo(file, isOnline) {
  const path = file.vUrl
  const title = addSlashes(file.body)
  const eventName = file.keywords && file.keywords.indexOf('ybVideo') > -1 ? 'loadYB' : 'loadMovie'
  fireEvent(eventName, {
    file: path,
    isOnline: isOnline,
    title: title,
    fileID: file.ID
  })
}

function loadVideo(file) {
  playVideo(file, 0)
}

function loadOnlineVideo(file) {
  playVideo(file, 1)
}

function loadSurvey(file, parameters) {
  const path = file.vUrl
  const title = addSlashes(file.body)
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

function loadInteractive(file, parameters) {
  const path = file.vUrl
  const title = addSlashes(file.body)
  let allowPortrait = 0,
    showBar = 1
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

export function openContent(file, parameters) {
  if (categoryActionMapping[file.category]) {
    file.lastLaunchTime = new Date().getTime().toString()
    categoryActionMapping[file.category](file, parameters)
  }
}

export function editFile(file) {
  const store = useFilesStore()
  store.oneTimeLoadPresentations = true
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

export function deleteFile(file) {
  const store = useFilesStore()
  store.oneTimeLoadPresentations = true
  fireEvent('deletePresentation', { dataOfPres: file })
}

export function sendPickingContent(fileIds, via) {
  fireEvent('sendPickingContent', { fileIDs: fileIds, via: via })
}

export function sendDocuments() {
  fireEvent('sendDocs')
}

export function createSlideSet() {
  const store = useFilesStore()
  store.oneTimeLoadPresentations = true
  editFile()
}

export function loadPresentationsFromDB() {
  fireEvent('loadPresentationsFromDB', {})
}

export function loadPresentationWithPage(fileId, page) {
  fireEvent('launchContentWithID', { fileID: fileId, subID: page })
}

export function loadPdfWithPage(file, page, searchText) {
  fireEvent('loadPDF', {
    file: file.vUrl,
    titleV: addSlashes(file.body),
    viewMode: 1,
    lockViewMode: null,
    references: null,
    articles: null,
    subFolder: null,
    annotationEnabled: true,
    jumpToPage: page,
    pdfID: file.ID,
    searchString: searchText
  })
}

window.finishedCreatingPresentation = function() {
  loadPresentationsFromDB()
}
