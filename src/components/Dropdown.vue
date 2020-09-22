<template>
    <div ref="dropdown" class="ui dropdown pitcher-dropdown" v-bind="dropdownAttr">
        <template v-if="hasDefaultSlot">
            <slot />
        </template>
        <template v-else>
            <!-- hidden value -->
            <input type="hidden" :value="value" />

            <!-- icon / if selection -->
            <i
                v-show="(selection && !isSearching) || (selection && multiple)"
                :class="[`${icon} icon`, { 'mr-2 ml-1': hasCustomIcon }]"
            />

            <!-- search input -->
            <input v-if="searchable" ref="search" class="search" autocomplete="off" tabindex="0" @input="onSearch" />

            <!-- selected text -->
            <div v-show="value" class="text" />

            <!-- placeholder -->
            <div v-show="!value && !isSearching" class="default" :style="{ left: hasCustomIcon ? '32px' : '' }">
                {{ defaultText }}
            </div>

            <!-- icon / if NOT selection -->
            <i v-if="!selection" :class="`${icon} icon mr-2`" />

            <!-- clear button -->
            <i v-if="clearBtnAttr.render" :class="clearBtnAttr.class" :style="clearBtnAttr.style" />

            <!-- menu items -->
            <div class="menu">
                <div
                    v-for="(item, index) in listItems"
                    :key="index"
                    :data-value="item.value"
                    :data-text="item.text"
                    :class="[item.type, { disabled: item.disabled }]"
                    @click="item.type === 'item' ? handleItemClick(item) : undefined"
                >
                    <img v-if="item.image" :src="item.image" class="image" />
                    <i v-if="item.icon" :class="`${item.icon} icon`" />
                    {{ item.text }}
                    <div v-if="item.description" class="description">{{ item.description }}</div>
                </div>
            </div>
        </template>
    </div>
</template>
<script>
import { computed, reactive, toRefs, onMounted } from '@vue/composition-api'
import { parsePxStyle, validateSize } from './mixins'

export default {
    props: {
        value: {
            required: true
        },
        items: {
            type: Array,
            required: false
        },
        itemText: {
            default: 'text'
        },
        itemValue: {
            default: 'value'
        },
        icon: {
            default: 'dropdown'
        },
        defaultText: {
            type: String,
            default: 'Select'
        },
        action: {
            type: String,
            default: 'activate'
        },
        settings: Object,
        fluid: Boolean,
        compact: Boolean,
        selection: {
            type: Boolean,
            default: true
        },
        multiple: Boolean,
        searchable: Boolean,
        clearable: Boolean,
        disabled: Boolean,
        loading: {
            type: Boolean,
            default: false
        },
        error: Boolean,
        color: String,
        minWidth: {
            type: [Number, String]
        },
        maxWidth: {
            type: [Number, String],
            default: '100%'
        },
        size: {
            type: String,
            validator: val => validateSize(val, 'Dropdown.vue')
        }
    },

    setup(props, { refs, emit, slots }) {
        // validate
        if (!props.selection && props.searchable) {
            console.error(`Combining searchable = true with selection = false is not recommended!`)
        }

        // local state
        const state = reactive({
            isSearching: false,
            isSingleItem: false,
            hasCustomIcon: props.icon !== 'dropdown',
            hasDefaultSlot: !!slots.default
        })

        const dropdownAttr = computed(() => ({
            class: {
                fluid: props.fluid,
                compact: props.compact,
                search: props.searchable,
                // false by default if default slot is used
                selection: state.hasDefaultSlot ? false : props.selection,
                'not-selection': !props.selection,
                multiple: props.multiple,
                loading: props.loading,
                disabled: props.disabled || props.loading,
                error: props.error,
                [props.color]: !!props.color,
                [props.size]: !!props.size
            },
            style: {
                minWidth: props.minWidth ? parsePxStyle(props.minWidth) : undefined,
                maxWidth: parsePxStyle(props.maxWidth)
            }
        }))

        const clearBtnAttr = computed(() => {
            const attr = {
                render:
                    // statements for v-if
                    (props.selection && props.clearable && props.value && !state.isSearching) ||
                    (props.selection && props.clearable && props.multiple && props.value) ||
                    (!props.selection && !props.multiple && props.clearable && props.value),
                class: 'remove icon',
                style: {
                    zIndex: '100',
                    display: 'inline-block',
                    right: state.hasCustomIcon || state.isSearching ? '1.5em' : undefined
                }
            }

            if (!props.selection && !props.multiple && props.clearable && props.value) {
                attr.style.right = '-10px'
                attr.style.top = '-2px'
            }
            return attr
        })

        // transform list items for dropdown
        const listItems = computed(() => {
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
                        icon: item.icon,
                        image: item.image,
                        disabled: item.disabled
                    }
                } else {
                    // if not key/value pair
                    state.isSingleItem = true
                    return {
                        text: item,
                        value: item,
                        type: 'item'
                    }
                }
            })
        })

        // fomantic dropdown initialization
        const initDropdown = () => {
            const settings = $.extend(
                {
                    action: props.action,
                    onChange: value => {
                        if (props.searchable) {
                            state.isSearching = false

                            if (props.multiple) {
                                refs.search.click()
                            }
                        }

                        // emit full object onChange as onSelected event
                        let returnValue = []

                        if (props.multiple || refs.dropdown.className.includes('multiple')) {
                            const split = value.split(',')
                            // usage with items
                            if (props.items) {
                                returnValue = props.items.filter(item => {
                                    const findItem = state.isSingleItem ? item : item[props.itemValue]
                                    if (split.includes(findItem)) {
                                        return item
                                    }
                                })
                            }
                        } else {
                            // usage with items
                            if (props.items) {
                                returnValue = state.isSingleItem
                                    ? value
                                    : props.items.find(item => item[props.itemValue] === value)
                            }
                        }
                        emit('input', value)
                        emit('onSelected', returnValue)
                    }
                },
                // additional settings for dropdown
                props.settings
            )
            // initialize
            $(refs.dropdown).dropdown(settings)
        }

        // function to run onSearch
        const onSearch = () => {
            state.isSearching = refs.search && !!refs.search.value
        }

        onMounted(() => {
            initDropdown()
        })

        // handle item click, without preventing default event
        function handleItemClick(item) {
            if (props.searchable && props.value === item.value) {
                refs.search.value = ''
                state.isSearching = false
            }
        }

        return {
            ...toRefs(state),
            dropdownAttr,
            listItems,
            clearBtnAttr,
            initDropdown,
            onSearch,
            handleItemClick
        }
    }
}
</script>

<style lang="scss" scoped>
.ui.dropdown.pitcher-dropdown {
    // default text color
    .default {
        color: rgba(191, 191, 191, 0.87) !important;
        display: inline-block;
        pointer-events: none;
    }

    &.multiple.search {
        .default {
            position: absolute;
            left: 8px;
        }
    }

    // image in list
    .item img {
        vertical-align: top;
        width: auto;
        margin: -0.5em 0.5em -0.5em 0;
        max-height: 2em;
    }

    &.not-selection:not(.labeled) {
        // any icon other than .dropdown
        & > .icon:not(.dropdown) {
            margin-left: 8px;
            margin-right: 0;
        }

        // when it is not a selection list
        & > .icon.dropdown {
            margin: 0 0.2em 0 1em;
        }
    }

    &.multiple {
        .default {
            padding-top: 8px;
            padding-left: 8px;
        }
    }
}
</style>
