<template>
    <table
        v-if="tableData.length > 0 || Object.keys(tableData).length > 0"
        class="ui table pitcher mb-6"
        :class="tableAttr.class"
        :style="tableAttr.style"
    >
        <thead v-if="!noHeader">
            <tr>
                <!-- If heading-row slot exist, override with a slot -->
                <template v-if="hasHeadingRowSlot">
                    <!-- map only visible fields, return rawData as well -->
                    <slot
                        name="heading-row"
                        :filteredFields="filteredFields"
                        :sortData="sort"
                        :sortTable="sortTable"
                        :getClass="getTHClass"
                    />
                </template>

                <!-- default table heading -->
                <template v-else v-for="f in fields">
                    <th
                        v-if="!f.hide"
                        :key="f.__colID"
                        :class="getTHClass(f)"
                        :style="{ width: f.width }"
                        v-on="f.sortable ? { click: () => sortTable(f) } : {}"
                    >
                        <!-- default -->
                        <span :data-tooltip="getTooltip(f)" :data-position="f.tooltip">
                            <!-- custom header injection -->
                            <template v-if="hasSlot(`${f.title}__slot`)">
                                <slot :name="`${f.title}__slot`" :field="f" />
                            </template>
                            <template v-else>
                                <i v-if="f.icon" class="icon" :class="f.icon" />
                                {{ f.title }}
                            </template>
                        </span>
                    </th>
                </template>
            </tr>
        </thead>
        <tbody>
            <!-- prepend-body slot -->
            <template v-if="hasPrependTbodySlot">
                <slot name="prepend-tbody" :mapper="mapper" />
            </template>

            <!-- body slot -->
            <template v-if="hasBodySlot">
                <slot
                    name="body"
                    :tableData="tableData"
                    :mapper="mapper"
                    :filteredFields="filteredFields"
                    :sortData="sort"
                    :pagination="pagination"
                />
            </template>

            <!-- Body with grouping -->
            <template v-else-if="!!groupBy && shouldGroup" v-for="(group, key) in tableData">
                <tr :key="key">
                    <td colspan="100%">
                        <div
                            class="ui large label blue"
                            :style="{ opacity: key === 'undefined' || key === 'null' ? 0 : undefined }"
                        >
                            {{ key }}
                        </div>
                    </td>
                </tr>

                <TableRow
                    v-for="item in group"
                    :key="item.__rowID"
                    :item="item"
                    :fields="filteredFields"
                    :tr-class="trClass"
                    :has-row-slot="hasRowSlot"
                    @click="emit('rowClick', item)"
                >
                    <!-- forward row slot -->
                    <template v-if="hasRowSlot" #row>
                        <slot
                            name="row"
                            :filteredFields="filteredFields"
                            :rowData="getScopeData(item)"
                            :raw="item"
                            :mapper="mapper"
                            :sortData="sort"
                            :pagination="pagination"
                        />
                    </template>

                    <!-- forward field slots -->
                    <template v-for="field in filteredFields.filter(f => !!f.slotName)" #[field.slotName]>
                        <slot
                            :name="field.slotName"
                            :rowData="item"
                            :value="mapper(field.dataField, item)"
                            :rowField="field"
                            :sortData="sort"
                        />
                    </template>
                </TableRow>
            </template>

            <!-- Default body without groups -->
            <TableRow
                v-else
                v-for="item in tableData"
                :key="item.__rowID"
                :item="item"
                :fields="filteredFields"
                :tr-class="trClass"
                :has-row-slot="hasRowSlot"
                @click="emit('rowClick', item)"
            >
                <!-- forward row slot -->
                <template v-if="hasRowSlot" #row>
                    <slot
                        name="row"
                        :filteredFields="filteredFields"
                        :rowData="getScopeData(item)"
                        :raw="item"
                        :mapper="mapper"
                        :sortData="sort"
                        :pagination="pagination"
                    />
                </template>

                <!-- forward field slots -->
                <template v-for="field in filteredFields.filter(f => !!f.slotName)" #[field.slotName]>
                    <slot
                        :name="field.slotName"
                        :rowData="item"
                        :value="mapper(field.dataField, item)"
                        :rowField="field"
                        :sortData="sort"
                    />
                </template>
            </TableRow>

            <!-- append-body slot -->
            <template v-if="hasAppendTbodySlot">
                <slot name="append-tbody" :mapper="mapper" />
            </template>
        </tbody>

        <!-- TFoot slot -->
        <template v-if="hasTFootSlot">
            <tfoot>
                <slot
                    name="t-foot"
                    :sortData="sort"
                    :tableData="tableData"
                    :pagination="pagination"
                    :paginate="paginate"
                />
            </tfoot>
        </template>

        <!-- Pagination -->
        <tfoot v-if="!noPagination && pagination.totalPages > 1">
            <tr>
                <th :colspan="fields.length" :class="`${alignPagination} aligned`">
                    <Pagination :pagination="pagination" :paginate="paginate" :size="paginationSize" />
                </th>
            </tr>
        </tfoot>
    </table>
    <!-- no-data-template slot -->
    <div v-else-if="hasNoDataSlot">
        <slot name="no-data-template" :noDataText="noDataText" />
    </div>
    <!-- default no data text -->
    <div v-else class="pitcher table no-data">
        <span class="ui text large grey center">{{ noDataText }}</span>
    </div>
</template>

<script>
import { defineComponent, computed, reactive, toRefs, watch, onMounted } from '@vue/composition-api'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import range from 'lodash/range'
import { mapper, sortBy } from './table.helpers'
import { search, uid } from '../../utils'
import Pagination from './Pagination.vue'
import TableRow from './TableRow.vue'

export default defineComponent({
    components: {
        Pagination,
        TableRow
    },
    props: {
        data: {
            type: Array,
            required: true
        },
        fields: {
            type: Array,
            required: true
        },
        searchFor: {
            type: [String, Number],
            default: ''
        },
        searchFields: Array,
        groupBy: {
            default: undefined
        },
        searchOptions: {
            type: Object,
            default: () => ({
                threshold: 0.15,
                distance: 1000,
                useExtendedSearch: true
            })
        },
        trClass: {
            type: [String, Function],
            default: undefined
        },
        width: {
            type: String,
            default: '100%'
        },
        maxWidth: {
            type: String
        },
        noDataText: {
            type: String,
            default: 'Table has not any data to show'
        },
        noHeader: {
            type: Boolean,
            default: false
        },
        fixedHeader: {
            type: Boolean,
            default: false
        },
        // Pagination related
        initialPage: {
            type: Number,
            default: 1
        },
        perPage: {
            type: Number,
            default: 15
        },
        totalVisible: {
            type: Number,
            default: 5
        },
        paginationSize: {
            type: String,
            default: ''
        },
        alignPagination: {
            type: String,
            default: 'right'
        },
        noPagination: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { slots, emit }) {
        // Local state
        const state = reactive({
            sort: {
                by: '',
                order: ''
            },
            pagination: {
                currentPage: props.initialPage,
                totalPages: Math.ceil(props.data.length / props.perPage),
                startPage: 1,
                endPage: 0,
                startIndex: 0,
                endIndex: 0,
                pages: []
            },
            shouldGroup: false,
            // Check slots if they exist
            hasRowSlot: !!slots.row,
            hasHeadingRowSlot: !!slots['heading-row'],
            hasAppendTbodySlot: !!slots['append-tbody'],
            hasPrependTbodySlot: !!slots['prepend-tbody'],
            hasBodySlot: !!slots.body,
            hasTFootSlot: !!slots['t-foot'],
            hasNoDataSlot: !!slots['no-data-template']
        })

        // Table classes
        const tableAttr = computed(() => ({
            class: {
                sortable: props.fields.some(f => f.sortable),
                'fixed-header': props.fixedHeader
            },
            style: {
                width: props.width,
                maxWidth: props.maxWidth
            }
        }))

        // generate colID for each field
        props.fields.forEach(i => {
            i.__colID = uid()
        })

        const injectIDs = (items, key) => {
            items.forEach(i => {
                i[key] = uid()
            })
        }

        // Where data is distributed to the table
        const tableData = computed(() => {
            let temp = props.data
            let backup = null

            // generate rowID for each row
            if (temp.find(i => !i.__rowID)) {
                injectIDs(temp, '__rowID')
            }

            // if search word exist
            if (props.searchFor !== '') {
                temp = search(temp, props.searchFor, props.searchFields, props.searchOptions)
            }

            // sort
            if (state.sort.by) {
                temp = sortBy(temp, props.fields, state.sort.by, state.sort.order)
            }

            // pagination active & paginate
            if (!props.noPagination) {
                calculatePagination(temp)
                temp = temp.slice(state.pagination.startIndex, state.pagination.startIndex + props.perPage)
            }

            // Group logic
            if (props.groupBy) {
                // take a backup
                backup = temp
                // sort before by group property
                temp = orderBy(temp, [props.groupBy], ['asc'])
                // group
                temp = groupBy(temp, props.groupBy)

                // if length is 1 and has only undefined key group
                // if searching or sorting
                // disable grouping
                if (
                    (Object.keys(temp).length === 1 &&
                        (Object.keys(temp).includes('undefined') || Object.keys(temp).includes('null'))) ||
                    state.sort.by ||
                    props.searchFor
                ) {
                    temp = backup
                    state.shouldGroup = false
                    return temp
                }

                state.shouldGroup = true
            }

            return temp
        })

        const filteredFields = computed(() => {
            return props.fields.filter(f => !f.hide)
        })

        // Calculate pagination data
        calculatePagination(props.data)

        // Set sort state
        function sortTable(field) {
            // reset sorting for other fields first
            props.fields
                .filter(f => f.dataField !== field.dataField && f.sorted)
                .forEach(f => {
                    if (f.sorted) {
                        delete f.sorted
                        state.sort.order = ''
                    }
                })
            // set sorting by
            state.sort.by = field.dataField
            switch (state.sort.order) {
                case '':
                    state.sort.order = 'asc'
                    field.sorted = 'asc'
                    break
                case 'asc':
                    state.sort.order = 'desc'
                    field.sorted = 'desc'
                    break
                case 'desc':
                    state.sort.by = ''
                    state.sort.order = ''
                    delete field.sorted
                    break
            }
            emit('onSort', state.sort)
        }

        // helper for building th class
        function getTHClass(f) {
            let cls = f.thClass ? f.thClass : ''
            cls += f.sortable ? ' sortable' : ' no-sort'

            cls += f.sorted ? ' sorted' : ''
            cls += f.sorted && f.sorted === 'desc' ? ' descending' : ' ascending'
            return cls
        }

        // filtered data thru fields
        function getScopeData(item) {
            const filtered = []
            props.fields.forEach(f => {
                if (!f.hide && typeof f.slotName !== 'string') {
                    filtered.push(mapper(f.dataField, item))
                }
            })
            return filtered
        }

        // get tooltip
        function getTooltip(f) {
            if (!f.tooltip) {
                return undefined
            }

            if (!f.tooltipText) {
                return f.title
            }
            return f.tooltipText
        }

        // Calculate pagination data
        function calculatePagination(data) {
            if (props.noPagination) {
                return
            }

            state.pagination.totalPages = Math.ceil(data.length / props.perPage)
            if (state.pagination.totalPages <= 10) {
                // less than 10 total pages so show all
                state.pagination.startPage = 1
                state.pagination.endPage = state.pagination.totalPages
            } else {
                // more than 10 total pages so calculate start and end pages
                if (state.pagination.currentPage <= props.totalVisible / 2) {
                    // Current near start
                    state.pagination.startPage = 1
                    state.pagination.endPage = props.totalVisible
                } else if (
                    state.pagination.currentPage + Math.floor(props.totalVisible / 2) >=
                    state.pagination.totalPages
                ) {
                    // Current near end
                    state.pagination.startPage = state.pagination.totalPages - (props.totalVisible - 1)
                    state.pagination.endPage = state.pagination.totalPages
                } else if (state.pagination.currentPage >= props.totalVisible / 2) {
                    // Current in mid
                    state.pagination.startPage = state.pagination.currentPage - Math.floor(props.totalVisible / 2)
                    state.pagination.endPage = state.pagination.currentPage + Math.floor(props.totalVisible / 2)
                }
            }
            state.pagination.startIndex = (state.pagination.currentPage - 1) * props.perPage
            state.pagination.endIndex = state.pagination.startIndex + props.perPage
            state.pagination.pages = range(state.pagination.startPage, state.pagination.endPage + 1)
        }

        // Paginate function, this is sent to Pagination component
        function paginate(to) {
            if (state.pagination.currentPage === to) {
                return
            }
            state.pagination.currentPage = to
        }

        // If heading is fixed
        function setHeadingFixed() {
            const tbody = document.querySelector('tbody')
            const scrollWidth = tbody.offsetWidth - tbody.scrollWidth
            const heading = document.querySelector('thead tr')
            const tfoot = document.querySelector('tfoot')
            heading.style.paddingRight = `${scrollWidth}px`
            tfoot.style.display = 'block'
        }

        function hasSlot(name) {
            return !!slots[name]
        }

        onMounted(() => {
            if (props.fixedHeader) {
                setHeadingFixed()
            }
        })

        // to fix pagination in search
        watch(
            () => props.searchFor,
            (newVal, oldVal) => {
                if (oldVal === undefined) {
                    return
                }

                if (newVal.length > 0 && oldVal.length === 0) {
                    paginate(1)
                } else if (newVal.length === 0 && oldVal.length > 0) {
                    paginate(1)
                }
                emit('onSearch', { key: props.searchFor, result: tableData.value })
            }
        )
        return {
            ...toRefs(state),
            tableData,
            filteredFields,
            tableAttr,
            sortTable,
            getTHClass,
            getScopeData,
            getTooltip,
            hasSlot,
            paginate,
            emit,
            mapper
        }
    }
})
</script>

<style lang="scss" scoped>
.ui.table.pitcher {
    &.sortable {
        // disable text selection
        > thead > tr > th {
            user-select: none;
        }

        // disable non-sortable th hover effect
        > thead > tr > th.no-sort:hover {
            cursor: default !important;
            background: #f9fafb !important;
        }
    }

    // Styles for fixed heading
    &.fixed-header {
        display: flex;
        flex-direction: column;
        height: 100%;

        thead,
        tbody {
            display: block;
        }

        thead {
            margin-right: 0px;

            tr {
                background-color: #f9fafb;

                td:first-child,
                td:last-child {
                    border-radius: 0 !important;
                }
            }
        }

        tbody {
            flex: 1;
            overflow-y: scroll;
        }

        tr {
            width: 100%;
            display: flex;
        }

        tr td,
        tr th {
            display: block;
            flex: 1;
        }
    }
}
// No data style
.pitcher.table.no-data {
    text-align: center;
    padding: 8px 0;
}
</style>
