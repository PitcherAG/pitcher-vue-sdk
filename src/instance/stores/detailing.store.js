import { PLATFORM } from '../../platform'
import { fireEvent } from '../../event'
import { createStore } from '../../store'
import { eventHub } from '../../utils'
import { loadConfig } from '../../config'
import { reactive, computed } from '@vue/composition-api'

const defaultOptions = { xPos: 50, yPos: 30, widthV: 160, heightV: 50 }

class DetailingStore {
  id = 'detailing'
  state = reactive({
    currentContact: null,
    currentAccount: null,
    hasActiveCall: computed(() => this.state.currentContact != null),
    todaysCalls: [],
    isFilterActive: false,
    quickStartEnabled: true,
    quickPlanningEnabled: true,
    selectedDate: null,
    events: [],
    unsubmitted: [],
    syncEvents: [],
    loggedIn: false
  })

  async setLoggedIn(value) {
    if (value && !this.state.loggedIn) {
      const config = await loadConfig('homescreen')
      this.state.quickStartEnabled = !config.disableQuickStart
      this.state.quickPlanningEnabled = !config.disableQuickPlanning
    }
    this.state.loggedIn = value
  }

  afterCallEnded() {
    this.state.currentContact = null
    this.state.currentAccount = null
  }

  setCurrentContact(newContact, newAccount) {
    const isAdding = this.state.currentContact != null
    if (newContact == null && newAccount == null) {
      this.afterCallEnded()
    } else {
      try {
        this.state.currentContact = JSON.parse(newContact)
        this.state.currentAccount = JSON.parse(newAccount)
      } catch (e) {
        console.log(e)
      }
      this.state.isFilterActive = this.state.currentContact != null && !isAdding
    }
    eventHub.$emit('contactChanged')
  }

  setQuickStart(response) {
    if (typeof response.quickstartenabled !== 'undefined') {
      this.state.quickStartEnabled = response.quickstartenabled == '1'
    } else {
      this.state.quickStartEnabled = true
    }
  }

  checkLogin(response) {
    if (response.loggedin == '0') {
      fireEvent('startDetailing', defaultOptions)
      return false
    }
    return true
  }

  createEvent(value) {
    return {
      Id: value.Id,
      isAllDay: !!value.IsAllDay,
      name: [value.AccountName, value.ContactName || ''].map(value => value).join(', '),
      date: new Date(value.StartDateTime)
    }
  }

  parseEventData(response, date) {
    this.state.selectedDate = date
    this.state.events = []
    this.state.unsubmitted = []
    this.setQuickStart(response)
    if (this.checkLogin(response)) {
      for (let i = 0; i < response.records.length; i++) {
        this.state.events.push(this.createEvent(response.records[i]))
      }
      for (let i = 0; i < response.unsubmitteds.length; i++) {
        this.state.events.push(this.createEvent(response.unsubmitteds[i]))
      }
    }
  }
}

export const useDetailingStore = () => {
  return createStore(new DetailingStore())
}

export function useDetailing() {
  return useDetailingStore().state
}

window.setCurrentContact = function(newContact, newAccount) {
  const store = useDetailingStore()
  store.setCurrentContact(newContact, newAccount)
}

export async function startStopDetailing(options) {
  const store = useDetailingStore()
  if (store.state.hasActiveCall) {
    fireEvent('stopDetailing', options || defaultOptions)
  } else {
    switch (PLATFORM) {
      case 'WINDOWS':
        store.parseEventData(await fireEvent('getCrmEventsForToday', { target: options || defaultOptions }), new Date())
        break
      default:
        fireEvent('startDetailing', options || defaultOptions)
        break
    }
  }
}

export function startPreCall(options) {
  const store = useDetailingStore()
  if (!store.state.hasActiveCall) {
    fireEvent('startPreCall', options)
  }
}

export async function getCrmEventsByDate(options, timestamp) {
  const store = useDetailingStore()
  store.parseEventData(
    await fireEvent('getCrmEventsByDate', { target: options || defaultOptions, timestamp: timestamp }),
    new Date(parseInt(timestamp))
  )
}

export function startDetailingWithID(Id) {
  fireEvent('startDetailingWithID', { ID: Id })
}

export function resyncData() {
  fireEvent('resyncData', {})
}

export function removeEvent(Id) {
  const store = useDetailingStore()
  fireEvent('removeEvent', { Id: Id })
  store.state.syncEvents = store.state.syncEvents.filter(event => event.Id != Id)
}

export function removeAllEvents() {
  const store = useDetailingStore()
  store.state.syncEvents.forEach(event => {
    fireEvent('removeEvent', { Id: event.Id })
  })
  store.state.syncEvents = []
}

window.loggedOut = function() {
  const store = useDetailingStore()
  store.setLoggedIn(false)
}

window.updateCRM = function() {
  const store = useDetailingStore()
  store.setLoggedIn(true)
}

window.enableCrm = function(enabled) {
  const store = useDetailingStore()
  store.setLoggedIn(enabled === 'true')
}
