import { computed, reactive, watch } from '@vue/composition-api'
import { getAttr } from '../utils/getAttr'

const stores = {}

export function transform(obj) {
    const prototype = Object.getPrototypeOf(obj)
    const descriptors = Object.getOwnPropertyDescriptors(prototype)
    let result = {}

    // data, string watches
    Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (key.startsWith('on_')) {
            return
        } else {
            result[key] = value
            if (typeof result[key] === 'function') {
                result[key].bind(result)
            }
        }
    })

    // function watches, methods, computed
    Object.keys(descriptors).forEach(key => {
        if (key !== 'constructor' && !key.startsWith('__')) {
            const get = descriptors[key].get
            const set = descriptors[key].set
            const value = descriptors[key].value
            if (key.startsWith('on_')) {
                return
            } else if (value) {
                result[key] = value
                if (typeof result[key] === 'function') {
                    result[key].bind(result)
                }
            } else if (get && set) {
                result[key] = computed({ get: get.bind(result), set: set.bind(result) })
            } else if (get) {
                result[key] = computed(get.bind(result))
            }
        }
    })
    result = reactive(result)

    Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (key.startsWith('on_')) {
            result[key] = watch(
                computed(() =>
                    getAttr(
                        result,
                        key
                            .substring(3)
                            .split('_')
                            .join('.')
                    )
                ),
                value
            )
        }
    })

    // function watches, methods, computed
    Object.keys(descriptors).forEach(key => {
        if (key !== 'constructor' && !key.startsWith('__')) {
            const get = descriptors[key].get
            const set = descriptors[key].set
            const value = descriptors[key].value
            if (key.startsWith('on_')) {
                result[key] = watch(
                    computed(() =>
                        getAttr(
                            result,
                            key
                                .substring(3)
                                .split('_')
                                .join('.')
                        )
                    ),
                    value
                )
            }
        }
    })
    return result
}

export function createStore(obj) {
    if (!obj.id) {
        throw 'store needs an id attribute'
    }
    if (stores && stores[obj.id]) {
        return stores[obj.id]
    }

    stores[obj.id] = transform(obj)

    if (stores[obj.id]) {
        return stores[obj.id]
    }
}
