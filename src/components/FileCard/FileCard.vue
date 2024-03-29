<template>
  <div class="file-card" :style="{ height: styles.containerH }">
    <div class="file-card__content ui segment pa-0" :style="{ height: styles.contentH }">
      <!-- Thumbnail -->
      <div
        class="file-card__content--image"
        :style="{
          backgroundImage: styles.imgUrl,
          height: styles.contentH,
        }"
        @click="emit('onClickImage')"
      />
      <!-- Favorite -->
      <div v-if="!hideFavorite" class="file-card__stacked button left" @click="emit('onClickFavorite')">
        <i class="icon large" :class="[{ outline: !isFavorite ? 'outline' : '' }, favoriteIcon]" />
      </div>
      <!-- New -->
      <div v-if="isNew" class="file-card__stacked right">
        <template v-if="hasNewSlot">
          <slot name="new" :newText="newText" />
        </template>
        <div v-else class="ui red mini label">{{ newText }}</div>
      </div>

      <!-- Actions -->
      <div v-if="showFileOptions" class="file-card__stacked right bottom">
        <div class="actions">
          <Dropdown v-model="optionsExpanded">
            <button class="ui button basic icon option-button">
              <i class="ellipsis horizontal icon fitted" />
            </button>
            <div class="menu">
              <!-- items slots -->
              <template v-if="hasItemsSlot">
                <slot name="items" />
              </template>
              <!-- default items -->
              <template v-else v-for="(o, i) in fileOptionsItems">
                <div :key="i" class="item" @click.stop="o.click">
                  <i class="icon thin" :class="o.icon" />
                  <span>{{ o.text }}</span>
                </div>
              </template>
            </div>
          </Dropdown>
        </div>
      </div>
      <!-- Date -->
      <div class="file-card__stacked left bottom">
        {{ date }}
      </div>
    </div>
    <template v-if="hasBodySlot">
      <slot name="body" />
    </template>

    <!-- Default Body -->
    <template v-else>
      <!-- File name -->
      <div class="file-card__file-name">{{ body }}</div>

      <!-- Keywords -->
      <div v-if="hasKeywordsSlot" class="mt-1">
        <slot name="keywords" />
      </div>
      <div v-else-if="keywords.length > 0" class="mt-1">
        <span class="ui text small file-card__keywords">
          {{ keywords }}
        </span>
      </div>
    </template>
  </div>
</template>

<script>
import Dropdown from '../Dropdown'
import { computed, defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'FileCard',
  components: {
    Dropdown,
  },
  props: {
    body: {
      type: String,
      default: '',
    },
    favoriteIcon: {
      type: String,
      default: 'star',
    },
    hideFavorite: {
      type: Boolean,
      default: false,
    },
    imgUrl: String,
    date: String,
    keywords: {
      type: String,
      default: '',
    },
    isFavorite: Boolean,
    isNew: Boolean,
    showFileOptions: {
      type: Boolean,
      default: true,
    },
    downloadText: {
      type: String,
      default: () => {
        $gettext('Download')
      },
    },
    shareText: {
      type: String,
      default: () => {
        $gettext('Share')
      },
    },
    newText: {
      type: String,
      default: () => {
        $gettext('New')
      },
    },
    height: {
      type: [String, Number],
      default: 295,
    },
    fileOptionsItems: {
      type: Array,
      default() {
        return [
          /* eslint-disable vue/no-deprecated-props-default-this */
          {
            text: this.downloadText,
            icon: 'download icon thin',
            click: () => this.$emit('onClickDownload'),
          },
          {
            text: this.shareText,
            icon: 'share icon thin',
            click: () => this.$emit('onClickShare'),
          },
          /* eslint-enable vue/no-deprecated-props-default-this */
        ]
      },
    },
  },
  emits: ['onClickDownload', 'onClickShare'],
  setup(props, { slots, emit }) {
    const state = reactive({
      optionsExpanded: false,
      hasItemsSlot: !!slots.items,
      hasNewSlot: !!slots.new,
      hasKeywordsSlot: !!slots.keywords,
      hasBodySlot: !!slots.body,
    })

    const styles = computed(() => ({
      containerH: `${parseInt(props.height)}px`,
      contentH: `${Math.ceil(parseInt(props.height) * 0.71)}px`,
      imgUrl: `url("${props.imgUrl}")`,
    }))

    return { ...toRefs(state), styles, emit }
  },
})
</script>

<style lang="scss">
@import '../../style/mixins.scss';

$card-height: 295px;
$card-content-height: 210px;

.file-card {
  font-size: 16px;
  flex-direction: column;
  flex-grow: 1;
  width: calc(20% - 16px);
  max-width: calc(20% - 16px);
  height: $card-height;
  min-width: 0;
  margin-right: 16px;

  @include md-only {
    width: calc(25% - 16px);
    max-width: calc(25% - 16px);
  }

  @include sm-only {
    width: calc(33.33% - 16px);
    max-width: calc(33.33% - 16px);
  }

  @include xl-only {
    width: calc(10% - 16px);
    max-width: calc(10% - 16px);
  }

  @include xs-only {
    width: 100%;
    max-width: 100%;
  }

  &__stacked {
    position: absolute;
    top: 0;
    left: auto;
    right: auto;
    padding: 12px;

    &.button {
      cursor: pointer;
    }

    &.left {
      left: 0px;
    }

    &.right {
      right: 0px;
    }

    &.bottom {
      top: auto;
      bottom: 0;
    }
  }

  &__file-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  &__keywords {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: #b3b3b3;
  }

  // Card content
  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: $card-content-height;

    &--image {
      flex: 1;
      cursor: pointer;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      background-origin: content-box;
      border-top-left-radius: 8.4px;
      border-top-right-radius: 8.4px;
      height: $card-content-height;
      padding: 36px;
    }
  }

  .option-button {
    margin-right: 0 !important;
    padding: 4px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    font-size: 14px;
    box-shadow: none !important;
    border: 1px solid #cac8c8;
  }
}
</style>
