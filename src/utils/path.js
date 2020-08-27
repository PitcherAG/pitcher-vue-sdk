function removeRoot(path) {
    const splits = path.split('.')
    if (splits.length === 1) {
        return path
    }
    splits.shift()
    path = splits.join('.')
    return path
}

function getPath(obj, path, ignoreRoot = false) {
    if (ignoreRoot) {
        path = removeRoot(path)
    }
    const splits = path.split('.')
    const attr = splits.shift()
    const result = obj[attr]
    if (splits.length === 0) {
        if (typeof result === 'function') {
            return result()
        }
        return result
    } else {
        return getPath(result, splits.join('.'))
    }
}

function joinPath () {
    const args = [].slice.call(arguments)
    let base = args[0]
    for (let i = 1; i < args.length; i++) {
        if (!args[i]) continue
        const next = args[i].replace(/^(\/|\\)/, '')
        base = base.replace(/(\/|\\)$/, '') + '/' + next
    }
    return base
}

export default getPath
export { removeRoot, joinPath }
