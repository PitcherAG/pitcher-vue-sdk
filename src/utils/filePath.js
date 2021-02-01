const splitStringAt = (value, index) => [value.substring(0, index), value.substring(index)]

export function getPitcherFolderPath() {
  let location = window.location.href

  if (!location.includes('zip/') && !location.startsWith('http')) {
    throw Error('"zip" folder not found in path')
  }
  const pos = location.lastIndexOf('zip//')
  if (pos !== -1) {
    const parts = splitStringAt(location, pos)
    location = parts[0] + parts[1].replace('zip//', 'zip/')
  }
  return location.split('zip/')[0]
}

export function getFullFilepath(vUrl) {
  return getPitcherFolderPath() + vUrl
}
