import { fireEvent } from '../../event'
import { query } from '../../db/query'
import { useDetailingStore, useSystemStore } from '../stores'
import { PLATFORM } from '../../platform'

export function showIOSSyncWindow(options) {
  fireEvent('showCachedOrders', options)
}

async function getiOSSyncEvents(source = 'homescreen') {
  const store = useDetailingStore()
  const appName = useSystemStore().state.appName
  const selectQuery =
    "SELECT rowid,event_name, event_time, lastResponse FROM tbl_reports_v3 WHERE event_name LIKE '%event_redirect%'"
  const events = await query(selectQuery, appName, false, source)
  store.state.syncEvents = events.map(event => {
    return {
      Id: event.rowid,
      name: event.event_name,
      time: event.event_time,
      date: event.event_time ? new Date(parseInt(event.event_time)) : '',
      response: event.lastResponse
    }
  })
  return store.state.syncEvents
}

async function getWindowsSyncEvents(source = 'homescreen') {
  const store = useDetailingStore()
  const selectQuery = "SELECT Id, Name, Time, Status FROM SQLiteEvent WHERE Name LIKE '%event_redirect%'"
  const events = await query(selectQuery, null, false, source)
  store.state.syncEvents = events.map(event => {
    return {
      Id: event.Id,
      name: event.Name,
      time: event.Time,
      date: event.Time ? new Date(parseInt(event.Time)) : '',
      response: event.Status
    }
  })
  return store.state.syncEvents
}

export async function getSyncEvents(source = 'homescreen') {
  switch (PLATFORM) {
    case 'IOS':
      getiOSSyncEvents(source)
      break
    case 'WINDOWS':
      getWindowsSyncEvents(source)
      break
    case 'ANDROID':
      ///TODO
      break
    default:
      break
  }
}
