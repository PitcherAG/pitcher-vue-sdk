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
            store.markFavorites(Object.assign({}, favoriteFileIds))
        })
    }
}

const FavoriteActions = new Actions()

export { FavoriteActions }
