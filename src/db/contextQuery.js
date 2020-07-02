import { query as oQuery } from './query'
import { useConfigStore } from '../config'
import { useParamsStore } from '../params'
import { renderContext } from '../utils'

export async function contextQuery(query, context, db = null) {
    if (!query) {
        throw Error('no query provided')
    }
    const configStore = useConfigStore()
    const params = useParamsStore().state
    query = query.split('TODAY').join("date('now')")
    const tableDict = configStore.getTableDict.value
    for (const a in context) {
        if (context.hasOwnProperty(a)) {
            tableDict[a] = context[a]
        }
    }
    if (params.account) {
        tableDict.account = params.account
        tableDict.contacts = params.contacts
    }
    if (params.salesForceUser) {
        tableDict.user = params.salesForceUser
    }
    if (params.user) {
        tableDict.user = params.user
    }
    if (params.locale) {
        tableDict.locale = params.locale
    }
    const q = renderContext(query, tableDict)
    try {
        const result = await oQuery(q, db)
        return result
    } catch (e) {
        console.error(q, tableDict)
        throw e
    }
}
