<template>
    <FileCardContainer>
        <FileCard img-url="thumbs/file_thumnail.png" :is-favorite="true" />
    </FileCardContainer>
</template>

<script>
import FileCardContainer from '../../../src/components/FileCard/FileCardContainer.vue'
import FileCard from '../../../src/components/FileCard/FileCard.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Favorite',
    components: { FileCard, FileCardContainer }
})
</script>
