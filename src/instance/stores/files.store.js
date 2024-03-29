import UI_CONSTANTS from '../constants'
import Vue from 'vue'
import { computed, reactive } from '@vue/composition-api'
import { createStore } from '../../store'
import { fireEvent } from '../../event'
import { joinPath } from '../../utils'

// fetch polyfill
if (!window.fetch) {
  import(/* webpackChunkName: "polyfill-fetch" */ 'whatwg-fetch')
}

class FilesStore {
  id = 'filesStore'
  oneTimeLoadPresentations = false
  state = reactive({
    files: [],
    uiFiles: computed(() => this.state.files.filter((file) => file.shouldShowInUI)),
    slides: [],
    documentPath: null,
    presentations: [],
    customs: [],
    initialAllowedIDs: null,
    allowedIDs: [],
  })

  /*
      Checks start datetime & end datetime of the distribution of file
  */
  isFileExpiredOrNotReady(now, startDate, endDate) {
    if (typeof startDate === 'undefined' || typeof endDate === 'undefined') return false
    // eslint-disable-next-line eqeqeq
    if (startDate == null || endDate == null) return false
    // eslint-disable-next-line eqeqeq
    if (startDate == 0 || endDate == 0) return false

    return startDate > now || endDate < now
  }

  /*
    Decides if:
    *  file is a valid content
    *  is not hidden from UI (e.g postcall)
    *  is not expired or ready to show
  */
  shouldShowInUI(now, file) {
    if (
      // eslint-disable-next-line eqeqeq
      file.ID[0] == 'T' ||
      // eslint-disable-next-line eqeqeq
      file.typeV == 7 ||
      // eslint-disable-next-line eqeqeq
      file.typeV == -1 ||
      // eslint-disable-next-line eqeqeq
      file.typeV == 0 ||
      // eslint-disable-next-line eqeqeq
      file.category == 'images' ||
      this.isFileExpiredOrNotReady(now, file.startDate, file.endDate)
    ) {
      return false
    }

    return true
  }

  /*
    Add extension to files, like if file should be shown in (whether it's ready or not)
    or adds thumbnail property
  */
  extendFiles(files) {
    const now = new Date().getTime() / 1000

    files.forEach((file) => {
      file.shouldShowInUI = this.shouldShowInUI(now, file)
      file.thumbnailUrl = joinPath(window.documentPath, file.thumb)
    })

    return files
  }

  /*
    When presentations are retrieved, validates arguments and created presentations
  */
  parsePresentations(files) {
    this.state.customs = []
    this.state.presentations = []
    files.forEach((file) => this.parseSinglePresentation(file))
    if (this.oneTimeLoadPresentations) {
      fireEvent('loadPresentationsFromDB', {})
      this.oneTimeLoadPresentations = false
    }
  }

  /*
        When it's all documents
    */
  parseCustomPdf(file) {
    file.ID = file.slideOrder.split(',')[0].split('|')[0]
    file.isCustomPdf = true

    return file
  }

  /*
    Single presentation object parse
  */
  parseSinglePresentation(file) {
    try {
      // eslint-disable-next-line eqeqeq
      if (file.isCustom != UI_CONSTANTS.IGNORE_CUSTOM_TYPE) {
        // eslint-disable-next-line eqeqeq
        if (typeof file.ID === 'undefined' || file.ID == null) {
          // eslint-disable-next-line no-param-reassign
          file = this.parseCustomPdf(file)
        }
        // eslint-disable-next-line eqeqeq
        if (file.vSubFolder == null) {
          file.containsMultiple = true
          file.vSubFolder = file.slideOrder.split(',')[0].split('|')[0]
          file.ID = file.slideOrder.split(',')[0].split('|')[0]
          // eslint-disable-next-line eqeqeq
          if (file.vSubFolder.indexOf('_') == -1) {
            file.isCustomPdf = true
          } else {
            file.ID = `${parseInt(file.ID)}`
          }
        }
        file.ID = `${file.ID}`
        file.isCustom ? this.addFileAsCustom(file) : this.mergePresentation(file)
      }

      return true
    } catch (e) {
      fireEvent('Error', e)
    }

    return false
  }

  createAppendCustomFile(original, file) {
    const customFile = {}

    Object.assign(customFile, original)
    Object.assign(customFile, file)
    customFile.body = file.presentationName
    this.state.customs.push(customFile)
  }

  /*
      Custom decks are retrived with presentation objects, this adds them to custom list
  */
  addFileAsCustom(file) {
    // eslint-disable-next-line eqeqeq
    let original = this.state.files.find((f) => f.ID == file.ID)

    if (original) {
      this.createAppendCustomFile(original, file)
    } else {
      // eslint-disable-next-line eqeqeq
      const originalSlide = this.state.slides.find((f) => f.vSubfolder == file.vSubFolder)

      if (originalSlide) {
        // eslint-disable-next-line eqeqeq
        original = this.state.files.find((f) => f.ID == originalSlide.ID)
        if (original) {
          file.ID = original.ID
          this.createAppendCustomFile(original, file)
        }
      }
    }
  }

  /*
      Extends presentation object with original file attributes
  */
  mergePresentation(file) {
    this.state.presentations.push(file)
    // eslint-disable-next-line eqeqeq
    const original = this.state.files.find((f) => f.ID == file.ID)

    if (original) {
      Object.assign(original, file)
    }
  }

  /*
      Favorite file Ids are retrieved separately, so files needs to be marked as favorite after that
      isFavorite property is added as an observable
  */
  markFavorites(fileIdMapping) {
    this.state.files.forEach((file) => {
      if (typeof file.isFavorite === 'undefined') {
        Vue.set(file, 'isFavorite', fileIdMapping[file.ID] || false)
      } else {
        file.isFavorite = fileIdMapping[file.ID] || false
      }
    })

    return this.state.files
  }

  /*
      Impact tells UIs which files should be shown in UI at a moment
      This filter might be due to now downloaded content(ios), or when call with pre selected is started (all platforms)
  */
  setAllowedIds(fileIds) {
    // eslint-disable-next-line eqeqeq
    if (fileIds && fileIds.length > 0 && this.state.initialAllowedIDs == null) {
      this.state.initialAllowedIDs = fileIds
    }
    this.state.allowedIDs = fileIds || []
  }
}

export const useFilesStore = () => {
  return createStore(new FilesStore())
}

window.getAllowedIDs = function() {
  const store = useFilesStore()

  return store.state.allowedIDs
}

function parseCustomDeckSlides(deck) {
  // return empty array if no slideOrder
  if (!deck.slideOrder) return []

  return deck.slideOrder.split(',').map((slide) => {
    const [deckId, index] = slide.split('|')

    return {
      deckId,
      index: parseInt(index) - 1,
    }
  })
}

// Generation of Chapters
function getChapterForSlideIndex(chapters, slideIndex) {
  if (!chapters) return null

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]

    if (slideIndex >= chapter.startIndex && slideIndex < chapter.endIndex) {
      return chapter
    }
  }

  return null
}

// Export for testing purposes
export async function generateCustomDeckChapters(presentations) {
  const emptyChapterName = '-'

  for (const key in presentations) {
    const deck = presentations[key]

    // break the loop if deck is not custom
    if (!deck.isCustom) continue

    const parsedSlides = parseCustomDeckSlides(deck)

    // break the loop if no parsedSlides
    if (parsedSlides.length === 0) continue

    const usedDecksIds = parsedSlides.reduce((accumulator, slide) => {
      accumulator.add(slide.deckId)

      return accumulator
    }, new Set())

    const chaptersByDeckId = new Map()

    for (const deckId of usedDecksIds) {
      try {
        const resp = await fetch(`${window.documentPath}/slides/${deckId}/chapters.json`)
        const data = await resp.json()

        chaptersByDeckId.set(deckId, data.chapters)
      } catch (e) {
        console.warn(`[Chapter Generation]: ${window.documentPath}/slides/${deckId}/chapters.json does not exist!`)
      }
    }

    parsedSlides.forEach((slide) => {
      const foundChapter = getChapterForSlideIndex(chaptersByDeckId.get(slide.deckId), slide.index)

      slide.chapterName = foundChapter?.nameV || emptyChapterName
    })

    if (parsedSlides[0]) {
      deck.setupJSON = await fetch(`${window.documentPath}/slides/${parsedSlides[0].deckId}/setup.json`)
        .then((r) => r.json())
        .catch(() => null)
    }

    deck.chapters = {
      chapters: parsedSlides
        .reduce((chapters, currentSlide, currentSlideIndex) => {
          const lastAddedChapter = chapters[chapters.length - 1]
          const hasSameID = currentSlide.deckId === lastAddedChapter?.deckId
          const hasSameName = currentSlide.chapterName === lastAddedChapter?.nameV
          const bothHasNameAsDash =
            currentSlide.chapterName === emptyChapterName && lastAddedChapter?.nameV === emptyChapterName

          if (lastAddedChapter && hasSameName && (hasSameID || (!hasSameID && bothHasNameAsDash))) {
            lastAddedChapter.endIndex = currentSlideIndex + 1
          } else {
            chapters.push({
              nameV: currentSlide.chapterName,
              deckId: currentSlide.deckId,
              startIndex: currentSlideIndex,
              endIndex: currentSlideIndex + 1,
            })
          }

          return chapters
        }, [])
        .filter((ch) => ch !== null)
        .map(({ nameV, startIndex, endIndex }) => ({ nameV, startIndex, endIndex })),
    }

    if (deck.chapters.chapters.length === 1 && deck.chapters.chapters[0].nameV === emptyChapterName) {
      deck.chapters.chapters = []
    }

    fireEvent('saveFromHTML', { id: deck.ID, variables: deck })
  }
}

window.loadPresentations = function(presentationsObject) {
  let presentations = presentationsObject

  if (typeof presentationsObject === 'string') {
    presentations = JSON.parse(presentations)
  }

  generateCustomDeckChapters(presentations).then(() => {
    window.presentationsObject = presentations

    if (window.presentationsObject) {
      const store = useFilesStore()

      store.parsePresentations(window.presentationsObject)
    }
  })
}

window.filterJSON = function(allowedIDsV) {
  const store = useFilesStore()

  if (allowedIDsV) {
    store.setAllowedIds(JSON.parse(allowedIDsV))
  } else {
    store.setAllowedIds([])
  }
}
