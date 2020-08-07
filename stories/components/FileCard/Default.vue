<template>
    <FileCard />
</template>

<script>
import FileCard from '../../../src/components/FileCard/FileCard.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Default',
    components: { FileCard }
})
</script>
