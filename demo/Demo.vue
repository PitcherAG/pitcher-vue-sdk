<template>
    <div class="pt-4 fill-height">
        <h2 class="mb-1">Demo Page</h2>
        <select v-model="selectedPage">
            <option v-for="page in pages" :key="page.value" :value="page.value">{{ page.text }}</option>
        </select>
        <div class="ui divider" />
        <component :is="selectedPage" />
    </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import CalendarEx from './examples/Calendar.example.vue'
import DataTableEx from './examples/DataTable.example.vue'
import DropdownEx from './examples/Dropdown.example.vue'
import FileCardEx from './examples/FileCard.example.vue'
import FilterEx from './examples/FilterDropdown.example.vue'
import ModalEx from './examples/Modal.example.vue'
import NumpadInputEx from './examples/NumpadInput.example.vue'
import ProgressBarEx from './examples/ProgressBar.example.vue'

export default {
    components: {
        CalendarEx,
        DataTableEx,
        DropdownEx,
        FileCardEx,
        FilterEx,
        ModalEx,
        NumpadInputEx,
        ProgressBarEx
    },
    setup() {
        const selectedPage = ref('CalendarEx')
        const pages = ref([
            {
                text: 'Modal',
                value: 'ModalEx'
            },
            {
                text: 'Numpad input',
                value: 'NumpadInputEx'
            },
            {
                text: 'Calendar',
                value: 'CalendarEx'
            },
            {
                text: 'Datatable',
                value: 'DataTableEx'
            },
            {
                text: 'Dropdown',
                value: 'DropdownEx'
            },
            {
                text: 'Filter Dropdown',
                value: 'FilterEx'
            },
            {
                text: 'File Card',
                value: 'FileCardEx'
            },
            {
                text: 'Progress Bar',
                value: 'ProgressBarEx'
            }
        ])
        return {
            pages,
            selectedPage
        }
    }
}
</script>

<style lang="scss">
//
</style>
