<template>
    <div ref="filter" class="ui dropdown pitcher-filter" v-bind="containerAttr">
        <!-- Button group for filter button -->
        <div
            class="ui buttons"
            :class="{ fluid, [size]: !!size }"
            :style="{ minWidth: width ? parsePxStyle(width) : undefined }"
        >
            <!-- Dropdown button text, +N text & icon -->
            <button ref="button" class="ui button" v-bind="buttonAttr">
                <div class="d-flex">
                    <i class="icon" :class="icon" />
                    <span
                        ref="buttonTextRef"
                        class="button-text"
                        :style="{
                            whiteSpace: truncateText ? 'nowrap' : undefined,
                            textOverflow: truncateText && value.length > 0 ? 'ellipsis' : undefined
                        }"
                    >
                        {{ buttonText }}
                    </span>
                    <span class="ml-1">{{ hasMoreSelected }}</span>
                </div>
                <i
                    v-if="!value.length"
                    class="chevron icon right-icon"
                    :class="{ down: !menuIsOpen, up: menuIsOpen }"
                />
            </button>
            <!-- clear button on side-->
            <template v-if="value.length > 0">
                <button
                    v-if="value.length > 0"
                    class="ui icon button"
                    :class="buttonAttr.class"
                    style="flex: 0;"
                    @click.stop="reset"
                    @touchstart.stop="reset"
                >
                    <i class="times icon right-icon" />
                </button>
            </template>
        </div>

        <!-- Dropdown menu -->
        <div v-bind="menuAttr">
            <!-- Header & Close button -->
            <template v-if="hasHeaderSlot" :closeMenu="closeMenu">
                <slot name="header" />
            </template>

            <!-- Default header -->
            <div v-else class="h-container d-flex align-items-center pa-3">
                <h3 class="ui header ma-0">
                    {{ title }}
                    <div v-if="value.length" class="ui circular label" :class="{ [color]: !!color, grey: !color }">
                        {{ value.length }}
                    </div>
                </h3>
                <!-- Close button -->
                <i class="times icon thin ml-auto" style="cursor: pointer; font-size: 1.1em" @click="closeMenu" />
            </div>

            <!-- Actions container -->
            <template v-if="hasActionsSlot" :selectAll="selectAll" :reset="reset">
                <slot name="actions" />
            </template>

            <!-- Default actions -->
            <div v-else class="a-container mb-4">
                <a href="#" @click="selectAll">
                    <span class="ui text" :class="{ [color]: !!color }">Select all</span>
                </a>
                <span class="ui large grey text mx-2">|</span>
                <a href="#" @click="reset">
                    <span class="ui text" :class="{ [color]: !!color }">Reset</span>
                </a>
            </div>

            <!-- Search container -->
            <div v-if="!hideSearch" class="s-container mb-4">
                <div class="ui fluid icon small input">
                    <input v-model="searchKey" type="text" placeholder="Search" />
                    <i v-if="searchKey" class="times thin icon link" @click="searchKey = ''" />
                </div>
                <!-- No data text -->
                <span v-if="listItems.length === 0" class="ui text grey mt-4 d-flex justify-content-center">{{
                    noDataText
                }}</span>
            </div>

            <!-- Prepend list slot -->
            <div v-if="hasPrependListSlot">
                <slot name="prepend-list" />
            </div>

            <!-- Items -->
            <div
                v-if="listItems.length > 0"
                class="ui grid fluid vertical menu sub-menu"
                :style="{ maxHeight: parsePxStyle(scrollHeight) }"
                @touchstart="isScrolling = false"
                @touchmove="isScrolling = true"
            >
                <div
                    v-for="(item, index) in listItems"
                    :key="index"
                    :class="[item.type, { disabled: item.disabled, active: isSelected(item) }]"
                    @click.prevent
                    @click.stop="item.type.includes('item') ? handleItemClick(item) : undefined"
                    @touchend.prevent="item.type.includes('item') ? handleItemClick(item) : undefined"
                >
                    <!-- if this is an item -->
                    <template v-if="item.type.includes('item')">
                        <Checkbox :value="isSelected(item)" :label="item.text" :size="size" />
                        <div v-if="item.description" class="description">{{ item.description }}</div>
                    </template>
                    <!-- not an item, put as plain text -->
                    <template v-else>{{ item.text }}</template>
                </div>
            </div>

            <!-- Append list slot -->
            <div v-if="hasAppendListSlot">
                <slot name="append-list" />
            </div>
        </div>
    </div>
</template>
<script>
import { computed, reactive, toRefs, onMounted, watch } from '@vue/composition-api'
import Checkbox from './Checkbox'
import { parsePxStyle, validateSize } from './mixins'
import { search } from '../utils'

export default {
    components: {
        Checkbox
    },
    props: {
        value: {
            type: Array,
            required: true
        },
        title: String,
        items: {
            type: Array,
            required: true
        },
        itemText: {
            default: 'text'
        },
        itemValue: {
            default: 'value'
        },
        returnType: {
            type: String,
            default: 'value'
        },
        icon: {
            default: 'filter'
        },
        fluid: Boolean,
        compact: Boolean,
        basic: Boolean,
        disabled: Boolean,
        inverted: Boolean,
        hideSearch: Boolean,
        truncateText: {
            type: Boolean,
            default: true
        },
        noDataText: {
            type: String,
            default: 'No results'
        },
        width: {
            type: [String, Number]
        },
        menuMinWidth: {
            type: [String, Number],
            default: 300
        },
        scrollHeight: {
            type: [String, Number],
            default: 250
        },
        color: String,
        size: {
            type: String,
            validator: val => validateSize(val, 'Dropdown.vue')
        }
    },
    emits: ['input'],
    setup(props, { refs, emit, root, slots }) {
        // local state
        const state = reactive({
            searchKey: '',
            menuIsOpen: false,
            hasMoreSelected: null,
            buttonText: props.title,
            shouldSort: false,
            isScrolling: false,
            hasCustomIcon: props.icon !== 'filter',
            hasHeaderSlot: !!slots.header,
            hasActionsSlot: !!slots.actions,
            hasPrependListSlot: !!slots['prepend-list'],
            hasAppendListSlot: !!slots['append-list']
        })

        const containerAttr = computed(() => {
            const attr = {
                class: {
                    fluid: !!props.fluid,
                    [props.size]: !!props.size,
                    disabled: !!props.disabled
                },
                style: {}
            }

            if (props.width) {
                // validate
                if (props.compact) {
                    throw `Combining compact = true with width is not recommended!`
                }
                attr.style.width = parsePxStyle(props.width)
                attr.style.maxWidth = parsePxStyle(props.width)
            }

            return attr
        })

        const buttonAttr = computed(() => ({
            class: {
                basic: props.basic,
                inverted: !!props.inverted,
                [props.color]: !!props.color,
                active: props.basic && props.value.length > 0,
                ['right labeled icon']: !props.value.length
            },
            style: {
                flex: 1,
                paddingLeft: '8px !important',
                paddingRight: props.value.length > 0 ? '8px !important' : undefined,
                textAlign: 'left',
                overflow: 'hidden'
            }
        }))

        const menuAttr = computed(() => ({
            class: {
                ['ui grid fluid vertical menu mt-2']: true
            },
            style: {
                minWidth: props.menuMinWidth ? parsePxStyle(props.menuMinWidth) : undefined
            }
        }))

        const parsedItems = computed(() => {
            if (!props.items) {
                return []
            }

            return props.items.map(item => {
                if (item.constructor === Object) {
                    return {
                        text: item[props.itemText],
                        value: item[props.itemValue],
                        type: item.type ? item.type : 'item',
                        description: item.description,
                        disabled: item.disabled
                    }
                } else {
                    // if not key/value pair
                    return {
                        text: item,
                        value: item,
                        type: 'item'
                    }
                }
            })
        })

        // transform list items for dropdown
        const listItems = computed(() => {
            let temp = parsedItems.value

            if (state.searchKey) {
                temp = search(temp, state.searchKey, ['value', 'text'])
            }

            if (state.shouldSort) {
                temp = temp.sort((a, b) => (isSelected(a) > isSelected(b) ? -1 : 1))
                state.shouldSort = false
            }

            return temp
        })

        // value watcher
        watch(
            () => props.value,
            async () => {
                if (!props.value.length) {
                    state.buttonText = props.title
                    state.hasMoreSelected = ''
                    return
                }

                state.buttonText = ''
                const selectedItems = parsedItems.value.filter(i => isSelected(i)).map(i => i.text)
                let lineBreakIndex = 0
                let textFitsContainer = true

                for (const [index, text] of selectedItems.entries()) {
                    state.buttonText += index === 0 ? `${text}` : `, ${text}`
                    await root.$nextTick()

                    if (refs.buttonTextRef && refs.buttonTextRef.scrollWidth > refs.buttonTextRef.offsetWidth) {
                        lineBreakIndex = index
                        textFitsContainer = false
                        break
                    }
                }

                if (!textFitsContainer) {
                    state.buttonText = selectedItems.join(', ')
                    state.hasMoreSelected = ` +${selectedItems.length - lineBreakIndex}`
                } else {
                    state.hasMoreSelected = ''
                }
            }
        )

        // fomantic dropdown initialization
        const initFilter = () => {
            // initialize
            $(refs.filter).dropdown({
                onShow: () => {
                    state.menuIsOpen = true
                    refresh()
                },
                onHide: () => {
                    state.menuIsOpen = false
                    state.searchKey = ''
                    state.shouldSort = true
                    refresh()
                }
            })
        }

        const refresh = () => {
            $(refs.filter).dropdown('refresh')
        }

        const closeMenu = () => {
            $(refs.filter).dropdown('hide')
        }

        const isSelected = item => {
            if (props.returnType === 'object') {
                return props.value.some(i => i.value === item.value)
            }
            return props.value.includes(item[props.returnType])
        }

        // handle item click, without preventing default event
        function handleItemClick(item) {
            // do nothing if scrolling
            if (state.isScrolling) {
                return
            }

            // select
            if (!isSelected(item)) {
                return props.returnType === 'object'
                    ? emit('input', [...props.value, item])
                    : emit('input', [...props.value, item[props.returnType]])
            }

            // unselect
            return props.returnType === 'object'
                ? emit(
                      'input',
                      props.value.filter(i => i.value !== item.value)
                  )
                : emit(
                      'input',
                      props.value.filter(v => v !== item[props.returnType])
                  )
        }

        function selectAll() {
            const notSelectedItems = listItems.value
                .filter(i => !i.disabled)
                .filter(i => i.type.includes('item'))
                .filter(i => !isSelected(i))
            return props.returnType === 'object'
                ? emit('input', [...props.value, ...notSelectedItems])
                : emit('input', [...props.value, ...notSelectedItems.map(i => i[props.returnType])])
        }

        function reset() {
            state.searchKey = ''
            emit('input', [])
        }

        onMounted(() => {
            // save initial button width
            if (!props.compact && !props.width) {
                const initialWidth = window.getComputedStyle(refs.button).width
                refs.filter.style.width = initialWidth
                refs.filter.style.maxWidth = initialWidth
            }
            // init
            initFilter()
        })

        return {
            ...toRefs(state),
            containerAttr,
            menuAttr,
            buttonAttr,
            listItems,
            handleItemClick,
            closeMenu,
            selectAll,
            reset,
            isSelected,
            refresh,
            parsePxStyle
        }
    }
}
</script>

<style lang="scss" scoped>
.ui.dropdown.pitcher-filter {
    .ui.buttons {
        width: 100%;
        max-width: 100%;

        & > button {
            width: 100%;
            line-height: 1.3em;

            &.basic:hover {
                background-color: inherit;
            }

            .button-text {
                flex: 1;
                // controlled by js
                // white-space: nowrap;
                // text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        .right-icon {
            background: transparent !important;
            background-color: transparent !important;
            top: 1px;
            height: calc(100% - 2px);
            right: 1px;
        }
    }

    .sub-menu {
        display: block !important;
        position: relative;
        margin: 0 !important;
        left: 0;
        box-shadow: none !important;
        border: none !important;
        overflow-y: auto;
        min-width: inherit;

        .item {
            font-size: 1rem !important;
            white-space: pre-wrap;
            overflow-x: hidden;

            label:hover {
                cursor: pointer;
            }
        }
    }
}
</style>
