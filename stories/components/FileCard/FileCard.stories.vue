<script>
import Default from './Default'
import Thumbnail from './Thumbnail'
import Favorite from './Favorite'

export default {
    title: 'FileCard',
    components: { Default }
}

export const DefaultCard = () => Default

export const ThumbnailCard = () => Thumbnail

export const FavoriteCard = () => Favorite
</script>
