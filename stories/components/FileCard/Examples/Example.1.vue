<template>
    <FileCardContainer>
        <FileCard
            img-url="thumbs/file_thumnail.png"
            body="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            :is-new="true"
            @onClickImage="
                {
                    action('onClickImage')
                }
            "
            @onClickFavorite="
                {
                    action('onClickFavorite')
                }
            "
        />
    </FileCardContainer>
</template>

<script>
import { action } from '@storybook/addon-actions'
import FileCardContainer from '../../../../src/components/FileCard/FileCardContainer.vue'
import FileCard from '../../../../src/components/FileCard/FileCard.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    name: 'Example1',
    components: { FileCard, FileCardContainer },
    setup() {
        const test = x => {
            action(x)
            console.log(x)
        }
        return { action, test }
    }
})
</script>
