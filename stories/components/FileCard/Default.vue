<template>
    <FileCardContainer>
        <FileCard />
    </FileCardContainer>
</template>

<script>
import FileCardContainer from '../../../src/components/FileCard/FileCardContainer.vue'
import FileCard from '../../../src/components/FileCard/FileCard.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Default',
    components: { FileCard, FileCardContainer }
})
</script>
