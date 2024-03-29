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
              textOverflow: truncateText && value.length > 0 ? 'ellipsis' : undefined,
            }"
          >
            {{ buttonText }}
          </span>
          <span class="ml-1">{{ hasMoreSelected }}</span>
        </div>
        <i v-if="!value.length" class="chevron icon right-icon" :class="{ down: !menuIsOpen, up: menuIsOpen }" />
      </button>

      <!-- clear button on side -->
      <template v-if="value.length > 0">
        <button
          v-if="value.length > 0"
          class="ui icon button reset-button-outer"
          :class="buttonAttr.class"
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
      <template v-if="hasHeaderSlot">
        <slot name="header" :closeMenu="closeMenu" />
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
      <template v-if="hasActionsSlot">
        <slot name="actions" :selectAll="selectAll" :reset="reset" />
      </template>

      <!-- Default actions -->
      <div v-else class="a-container mb-4">
        <a href="#" @click="selectAll">
          <span class="ui text" :class="{ [color]: !!color }">{{ $gettext('Select all') }}</span>
        </a>
        <span class="ui large grey text mx-2">|</span>
        <a href="#" @click="reset">
          <span class="ui text" :class="{ [color]: !!color }">{{ $gettext('Reset') }}</span>
        </a>
      </div>

      <!-- Search container -->
      <div v-if="!hideSearch" class="s-container mb-4">
        <div class="ui fluid icon small input">
          <input :value="searchKey" type="text" :placeholder="$gettext('Search')" @input="onSearch" />
          <i v-if="searchKey" class="times thin icon link" @click="searchKey = ''" />
        </div>
        <!-- No data text -->
        <span v-if="listItems.length === 0" class="ui text grey mt-4 d-flex justify-content-center">
          {{ noDataText }}
        </span>
      </div>

      <!-- Prepend list slot -->
      <div v-if="hasPrependListSlot">
        <slot name="prepend-list" />
      </div>

      <!-- Items -->
      <div
        v-if="listItems.length > 0"
        ref="uiGridEl"
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
        <div v-if="showLoadMore" class="a-container load-more mt-2 mb-2">
          <a href="#" class="d-block" @click.prevent="loadMore">{{ $gettext('Load more') }}</a>
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
/* eslint-disable vue/no-unused-properties, vue/no-side-effects-in-computed-properties */
import Checkbox from './Checkbox'
import { computed, onMounted, reactive, ref, toRefs, watch } from '@vue/composition-api'
import { debounce } from 'lodash'
import { parsePxStyle, validateSize } from './mixins'
import { search } from '../utils'

export default {
  name: 'FilterDropdown',
  components: {
    Checkbox,
  },
  props: {
    value: {
      type: Array,
      required: true,
    },
    title: String,
    items: {
      type: Array,
      required: true,
    },
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    returnType: {
      type: String,
      default: 'value',
    },
    icon: {
      type: String,
      default: 'filter',
    },
    fluid: Boolean,
    compact: Boolean,
    basic: Boolean,
    disabled: Boolean,
    inverted: Boolean,
    hideSearch: Boolean,
    truncateText: {
      type: Boolean,
      default: true,
    },
    noDataText: {
      type: String,
      default: () => {
        $gettext('No results')
      },
    },
    width: {
      type: [String, Number],
    },
    menuMinWidth: {
      type: [String, Number],
      default: 300,
    },
    scrollHeight: {
      type: [String, Number],
      default: 250,
    },
    color: String,
    size: {
      type: String,
      validator: (val) => validateSize(val, 'Dropdown.vue'),
    },
    itemsPerPage: {
      type: Number,
      default: null,
    },
    debounceTime: {
      type: Number,
      default: 0,
    },
  },
  emits: ['input'],
  setup(props, { refs, emit, root, slots }) {
    const uiGridEl = ref(null)

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
      hasAppendListSlot: !!slots['append-list'],
      itemsVisible: props.itemsPerPage,
    })

    const containerAttr = computed(() => {
      const attr = {
        class: {
          fluid: !!props.fluid,
          [props.size]: !!props.size,
          disabled: !!props.disabled,
        },
        style: {},
      }

      if (props.width) {
        // validate
        if (props.compact) {
          throw new Error(`Combining compact = true with width is not recommended!`)
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
        ['right labeled icon']: !props.value.length,
      },
      style: {
        flex: 1,
        paddingLeft: '8px !important',
        paddingRight: props.value.length > 0 ? '8px !important' : undefined,
        textAlign: 'left',
        overflow: 'hidden',
      },
    }))

    const menuAttr = computed(() => ({
      class: {
        ['ui grid fluid vertical menu mt-2']: true,
      },
      style: {
        minWidth: props.menuMinWidth ? parsePxStyle(props.menuMinWidth) : undefined,
      },
    }))

    const parsedItems = computed(() => {
      if (!props.items) {
        return []
      }

      return props.items.map((item) => {
        if (item.constructor === Object) {
          return {
            text: item[props.itemText],
            value: item[props.itemValue],
            type: item.type ? item.type : 'item',
            description: item.description,
            disabled: item.disabled,
          }
        } else {
          // if not key/value pair
          return {
            text: item,
            value: item,
            type: 'item',
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
        // alphabetically sort in asc order
        temp = temp.sort((a, b) => b.text?.localeCompare(a.text))

        // move selected items on top
        temp = temp.sort((a, b) => {
          return isSelected(a) > isSelected(b) ? -1 : 1
        })

        state.shouldSort = false
      }

      if (props.itemsPerPage) {
        temp = temp.slice(0, state.itemsVisible)
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
        const selectedItems = parsedItems.value.filter((i) => isSelected(i)).map((i) => i.text)
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
        showOnFocus: false,
        onShow: () => {
          state.menuIsOpen = true
          refresh()
        },
        onHide: () => {
          state.menuIsOpen = false
          state.searchKey = ''
          state.shouldSort = true
          refresh()
        },
      })
    }

    const refresh = () => {
      $(refs.filter).dropdown('refresh')
    }

    const closeMenu = () => {
      $(refs.filter).dropdown('hide')
    }

    const isSelected = (item) => {
      if (props.returnType === 'object') {
        return props.value.some((i) => i.value === item.value)
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
        if (props.returnType === 'object') {
          // eslint-disable-next-line consistent-return
          return emit('input', props.value.concat([item]))
        } else {
          // eslint-disable-next-line consistent-return
          return emit('input', props.value.concat([item[props.returnType]]))
        }
      }

      // unselect
      // eslint-disable-next-line consistent-return
      return props.returnType === 'object'
        ? emit(
            'input',
            props.value.filter((i) => i.value !== item.value)
          )
        : emit(
            'input',
            props.value.filter((v) => v !== item[props.returnType])
          )
    }

    function selectAll() {
      const notSelectedItems = parsedItems.value
        .filter((i) => !i.disabled)
        .filter((i) => i.type.includes('item'))
        .filter((i) => !isSelected(i))

      return props.returnType === 'object'
        ? emit('input', [...props.value, ...notSelectedItems])
        : emit('input', [...props.value, ...notSelectedItems.map((i) => i[props.returnType])])
    }

    function reset() {
      state.searchKey = ''
      emit('input', [])
    }

    function loadMore() {
      const toSet = state.itemsVisible + props.itemsPerPage

      state.itemsVisible = toSet > parsedItems.value.length ? parsedItems.value.length : toSet
      // Scroll the list items container to the bottom when items are added
      root.$nextTick(() => {
        uiGridEl.value.scrollTop = uiGridEl.value.scrollHeight
      })
    }

    const showLoadMore = computed(() => {
      if (props.itemsPerPage && parsedItems.value.length > state.itemsVisible) {
        return true
      }

      return false
    })

    const onSearch = debounce((e) => {
      state.searchKey = e.target.value
    }, props.debounceTime)

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
      uiGridEl,
      ...toRefs(state),
      containerAttr,
      menuAttr,
      buttonAttr,
      listItems,
      handleItemClick,
      closeMenu,
      selectAll,
      reset,
      loadMore,
      onSearch,
      showLoadMore,
      isSelected,
      refresh,
      parsePxStyle,
    }
  },
}
</script>

<style lang="scss" scoped>
@import '../style/mixins.scss';

.ui.dropdown.pitcher-filter {
  .ui.buttons {
    width: 100%;
    max-width: 100%;
    border-radius: 4px;

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

      @include polyfillIE {
        border-left: 1px transparent !important;
      }
    }

    .right-icon {
      background: transparent !important;
      background-color: transparent !important;
      top: 1px;
      height: calc(100% - 2px);
      right: 1px;
    }

    .reset-button-outer {
      flex-grow: 0;
      flex-shrink: 1;
      max-width: 38.5px;
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

  .load-more {
    text-align: center;
  }
}
</style>
