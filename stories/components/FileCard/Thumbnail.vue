<template>
    <FileCard img-url="thumbs/file_thumnail.png" />
</template>

<script>
import FileCard from '../../../src/components/FileCard/FileCard.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Thumbnail',
    components: { FileCard }
})
</script>
