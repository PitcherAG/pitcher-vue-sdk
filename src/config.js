import { fireEvent } from './event'
import { PLATFORM } from './platform'
import { createStore } from './store'

class ConfigStore {
  id = 'config'
  state = {
    customCaches: null
  }

  get getTableDict() {
    const d = {}
    if (!this.state.customCaches) {
      return d
    }
    for (let i = 0; i < this.state.customCaches.length; i++) {
      const table = this.state.customCaches[i]
      d[table.sfObjectName] = table.tableToCache
      d[table.objectName] = table.tableToCache
    }
    return d
  }

  get getCacheDict() {
    const d = {}
    if (!this.state.customCaches) {
      return d
    }
    for (let i = 0; i < this.state.customCaches.length; i++) {
      const table = this.state.customCaches[i]
      d[table.sfObjectName] = table
      d[table.objectName] = table
    }
    return d
  }
}

export function useConfigStore() {
  return createStore(new ConfigStore())
}

export async function loadConfig(source = 'modal') {
  const store = useConfigStore()
  let result = await fireEvent('getAppConfig', { source: source })
  console.log('app config', result)
  if (PLATFORM === 'IOS') {
    result.customCaches.push({
      objectName: 'Account',
      sfObjectName: 'Account',
      tableToCache: 'tbl_crm_accounts_m_v3',
      query: result.sfdcAccountQuery,
      fieldTypes: {
        account: 'TEXT',
        id: 'TEXT',
        lat: 'TEXT',
        lon: 'TEXT',
        city: 'TEXT',
        lastVisit: 'TEXT',
        accountName: 'TEXT'
      }
    })
    result.customCaches.push({
      objectName: 'Contact',
      sfObjectName: 'Contact',
      tableToCache: 'tbl_crm_contacts_m_v4',
      query: result.sfdcContactQuery,
      fieldTypes: {
        contact: 'TEXT',
        id: 'TEXT',
        accountID: 'TEXT',
        lastVisit: 'TEXT',
        name: 'TEXT'
      }
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'tbl_calls',
      query: ''
    })
    result.customCaches.push({
      objectName: 'User',
      sfObjectName: 'User',
      tableToCache: 'tbl_crm_users_m_v3',
      query: '',
      fieldTypes: {
        userObject: 'TEXT',
        id: 'TEXT',
        lastName: 'TEXT',
        firstName: 'TEXT',
        name: 'TEXT',
        roleID: 'TEXT',
        parentRoleID: 'TEXT',
        extraField: 'TEXT'
      }
    })
  } else if (PLATFORM === 'ANDROID') {
    result.customCaches.push({
      objectName: 'Account',
      sfObjectName: 'Account',
      tableToCache: 'tbl_crm_accounts',
      query: result.sfdcAccountQuery
    })
    result.customCaches.push({
      objectName: 'Contact',
      sfObjectName: 'Contact',
      tableToCache: 'tbl_crm_contacts',
      query: result.sfdcContactQuery
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'tbl_calls',
      query: ''
    })
    result.customCaches.push({
      objectName: 'User',
      sfObjectName: 'User',
      tableToCache: 'tbl_crm_users',
      query: ''
    })
  } else if (PLATFORM === 'WINDOWS') {
    result = result[0]
    result.customCaches.push({
      objectName: 'Account',
      sfObjectName: 'Account',
      tableToCache: 'SQLiteSfAccount',
      query: result.sfdcAccountQuery
    })
    result.customCaches.push({
      objectName: 'Contact',
      sfObjectName: 'Contact',
      tableToCache: 'SQLiteSfContact',
      query: result.sfdcContactQuery
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'SQLiteSfEvent',
      query: ''
    })
    result.customCaches.push({
      objectName: 'User',
      sfObjectName: 'User',
      tableToCache: 'SQLiteSfUser',
      query: ''
    })
  } else {
    throw new Error('platform not supported:' + PLATFORM)
  }
  for (const a in result) {
    store.state[a] = result[a]
  }
  return store.state
}
