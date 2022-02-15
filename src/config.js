import { PLATFORM } from './platform'
import { createStore } from './store'
import { fireEvent } from './event'

class ConfigStore {
  id = 'config'
  state = {
    customCaches: null,
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

function parseConfigData(data) {
  let result = data

  data.customCaches = Array.isArray(data.customCaches) ? data.customCaches : []

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
        accountName: 'TEXT',
      },
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
        name: 'TEXT',
      },
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'tbl_calls',
      query: '',
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
        extraField: 'TEXT',
      },
    })
  } else if (PLATFORM === 'ANDROID') {
    result.customCaches.push({
      objectName: 'Account',
      sfObjectName: 'Account',
      tableToCache: 'tbl_crm_accounts',
      query: result.sfdcAccountQuery,
    })
    result.customCaches.push({
      objectName: 'Contact',
      sfObjectName: 'Contact',
      tableToCache: 'tbl_crm_contacts',
      query: result.sfdcContactQuery,
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'tbl_calls',
      query: '',
    })
    result.customCaches.push({
      objectName: 'User',
      sfObjectName: 'User',
      tableToCache: 'tbl_crm_users',
      query: '',
    })
  } else if (PLATFORM === 'WINDOWS') {
    result = result[0]
    result.customCaches.push({
      objectName: 'Account',
      sfObjectName: 'Account',
      tableToCache: 'SQLiteSfAccount',
      query: result.sfdcAccountQuery,
      fieldTypes: {
        BillingCity: 'TEXT',
        BillingCountry: 'TEXT',
        BillingStreet: 'TEXT',
        Id: 'TEXT',
        ExternalId: 'TEXT',
        Json: 'TEXT',
        JsonUntouched: 'TEXT',
        LastModifiedDate: 'TEXT',
        LastModifiedTimeStamp: 'INTEGER',
        LastVisitTimeStamp: 'INTEGER',
        Lat__c: 'REAL',
        Long__c: 'REAL',
        Name: 'TEXT',
      },
    })
    result.customCaches.push({
      objectName: 'Contact',
      sfObjectName: 'Contact',
      tableToCache: 'SQLiteSfContact',
      query: result.sfdcContactQuery,
      fieldTypes: {
        Id: 'TEXT',
        ExternalId: 'TEXT',
        LastModifiedDate: 'TEXT',
        Name: 'TEXT',
        AccountId: 'TEXT',
        Email: 'TEXT',
        Json: 'TEXT',
        JsonUntouched: 'TEXT',
      },
    })
    result.customCaches.push({
      objectName: 'Call',
      sfObjectName: 'Call',
      tableToCache: 'SQLiteSfEvent',
      query: '',
    })
    result.customCaches.push({
      objectName: 'User',
      sfObjectName: 'User',
      tableToCache: 'SQLiteSfUser',
      query: '',
      fieldTypes: {
        Id: 'TEXT',
        IsActive: 'INTEGER',
        LastModifiedDate: 'TEXT',
        FirstName: 'TEXT',
        LastName: 'TEXT',
        Json: 'TEXT',
      },
    })
  } else {
    throw new Error(`Platform not supported: ${PLATFORM}`)
  }

  return result
}

export async function loadConfig(source = 'modal') {
  const store = useConfigStore()
  const config = await fireEvent('getAppConfig', { source })

  if (typeof config.userAttrSpecificSettings !== 'undefined') {
    const sfInfo = await fireEvent('getSFInfo', { source })
    const user = sfInfo && sfInfo.user ? sfInfo.user : undefined

    if (user) {
      config.userAttrSpecificSettings.forEach((custom) => {
        const value = user[custom.attrP]
        const matches = value && value.includes(custom.valueP)

        if (matches) {
          if (custom.typeP === 'replace') {
            for (const a in custom.settings) {
              config[a] = custom.settings[a]
            }
          } else if (custom.typeP === 'add') {
            for (const a in custom.settings) {
              if (!config[a]) {
                config[a] = []
              }
              if (Array.isArray(custom.settings[a])) {
                config[a] = config[a].concat(custom.settings[a])
              } else {
                config[a].push(custom.settings[a])
              }
            }
          }
        }
      })
    }
  }

  console.log('[@pitcher/core]: app config', config)

  const parsedData = parseConfigData(config)

  for (const a in parsedData) {
    store.state[a] = parsedData[a]
  }

  return store.state
}
