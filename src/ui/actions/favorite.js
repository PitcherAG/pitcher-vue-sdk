import { fireEvent } from '../../event'
import { useServerJSONStore } from '../serverJSONStore'

class Actions {
    addFavorite(file) {
        file.isFavorite = true
        fireEvent('addFavoriteItem', { fileID: file.ID })
    }

    removeFavorite(file) {
        file.isFavorite = false
        fireEvent('removeFavoriteItem', { fileID: file.ID })
    }

    async getFavorites() {
        fireEvent('getFavoriteItems', { source: 'homescreen' }).then(favoriteFileIds => {
            const store = useServerJSONStore()
            const map = {}
            if (favoriteFileIds && favoriteFileIds.length) {
                favoriteFileIds.forEach(Id => (map[Id] = true))
            }
            store.markFavorites(map)
        })
    }
}

const FavoriteActions = new Actions()

export { FavoriteActions }
