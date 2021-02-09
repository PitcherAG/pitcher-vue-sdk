import { fireEvent } from '../../event'
import { useFilesStore } from '../stores/index'

export function addFavorite(file) {
  file.isFavorite = true
  fireEvent('addFavoriteItem', { fileID: file.ID })
}

export function removeFavorite(file) {
  file.isFavorite = false
  fireEvent('removeFavoriteItem', { fileID: file.ID })
}

export async function getFavorites() {
  fireEvent('getFavoriteItems', { source: 'homescreen' }).then(favoriteFileIds => {
    const store = useFilesStore()
    const map = {}
    if (favoriteFileIds && favoriteFileIds.length) {
      favoriteFileIds.forEach(Id => (map[Id] = true))
    }
    store.markFavorites(map)
  })
}
