import Fuse from 'fuse.js/dist/fuse.min.js'

/**
 * fuse.js search
 * data array to search thru
 * @param {Array} [data]
 * search keyword
 * @param {String} [searchFor]
 * string array search fields
 * @param {Array} [fields]
 * fuse.js options - you can use fuse.js options here
 * @param {Object} [options]
 * to return complete fuse.js array
 * @param {Boolean} [returnFull]
 * @return {Array}
 *
 * @example
 * ```
 * const result = search(dataArray, searchFor, ['objProp', 'objProp.nested'], fuseOptions, false)
 * ```
 **/

export const search = (
  data,
  searchFor,
  fields,
  options = { threshold: 0.15, distance: 1000, useExtendedSearch: true },
  returnFull = false
) => {
  if (fields) {
    options.keys = fields
  }

  const fuse = new Fuse(data, { ...options })

  const result = fuse.search(`${options.useExtendedSearch ? "'" : ''}${searchFor}`)

  if (returnFull) {
    return result
  }

  return result.map(i => i.item && i.item)
}
