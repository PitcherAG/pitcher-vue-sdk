import { fireEvent } from '../event'
import { PLATFORM } from '../platform'

let cache = {}

const dbSettings = {
  cacheEnabled: false,
  cacheTimeout: 500,
  defaultDatabase: 'pitcher',
  longQueryWarning: false
}

function cacheQuery(query, result) {
  cache[query] = {
    result: result,
    time: Date.now()
  }
}

function clearCache() {
  cache = {}
}

function hasCached(query) {
  return (
    dbSettings.cacheEnabled &&
    !query.toLowerCase().includes('delete') &&
    !query.toLowerCase().includes('insert') &&
    Object.prototype.hasOwnProperty.call(cache, query) &&
    cache[query].time + dbSettings.cacheTimeout > Date.now()
  )
}

async function query(query, db = null, removeNull = false, source = 'modal') {
  if (process.env.LOG) {
    console.log(query)
  }
  return new Promise((resolve, reject) => {
    if (hasCached(query) && dbSettings.cacheEnabled) {
      console.log('cache hit')
      return resolve(cache[query].result)
    }
    const start = new Date()
    fireEvent('dbFunction', {
      db: db ? db : dbSettings.defaultDatabase,
      iosMode: true,
      pType: 'query',
      query: query,
      source: source
    })
      .then(e => {
        const time = new Date() - start
        if (time > 1000 && dbSettings.longQueryWarning) {
          console.warn('slow query (' + (time / 1000).toFixed(2) + 's): ' + query)
        }
        const result = []
        if (e.error) {
          console.error(query)
          reject(new Error(e.error))
        }
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i]
          const obj = {}

          for (let j = 0; j < e.columns.length; j++) {
            const column = e.columns[j]
            let fieldData = res[j]
            if (PLATFORM === 'WINDOWS' && typeof fieldData === 'string') {
              fieldData = fieldData.replace(/''/g, "'")
            }
            if (
              column === 'extraField' ||
              column === 'account' ||
              column === 'eventJSON' ||
              column === 'contact' ||
              column === 'Json' ||
              column === 'user' ||
              column === 'userObject'
            ) {
              const o = JSON.parse(fieldData)
              for (const n in o) {
                if (Object.prototype.hasOwnProperty.call(o, n) && n !== 'attributes') {
                  if (!(removeNull && o[n] === null)) {
                    obj[n] = o[n]
                  }
                }
              }
            } else {
              if (typeof fieldData == 'undefined') {
                obj[column] = null
              } else {
                obj[column] = fieldData
              }
            }
          }
          result.push(obj)
        }
        if (dbSettings.cacheEnabled) {
          cacheQuery(query, result)
        }
        resolve(result)
      })
      .catch(reject)
  })
}

export { clearCache, dbSettings, query }
